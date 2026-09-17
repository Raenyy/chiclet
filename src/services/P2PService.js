import Peer from 'peerjs';

const CHUNK_SIZE = 14000;

class P2PService {
  constructor() {
    this.peer = null;
    this.peerId = null;
    this.username = null;
    this.connections = new Map(); // peerId -> DataConnection
    this.peersInfo = new Map();   // peerId -> { username, connectedAt }
    this.mediaCalls = new Map();  // peerId -> MediaConnection
    this.onMessageCallbacks = [];
    this.onStreamCallbacks = [];
    this.onPeerJoinCallbacks = [];
    this.onPeerLeaveCallbacks = [];
    this.onReadyCallbacks = [];
    this.localStream = null;
    this.isInitialized = false;
    this.incomingChunks = new Map(); // chunkId -> { total, received, parts }
  }

  // Kullanıcı için P2P oturumunu başlatır
  init(username, customRoomCode = null) {
    if (this.peer && this.peerId && this.isInitialized) {
      this.username = username || this.username;
      return Promise.resolve(this.peerId);
    }

    this.username = username || 'Misafir';
    const sanitizedName = (username || 'user').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);

    let finalId = customRoomCode;
    if (!finalId) {
      const savedCode = localStorage.getItem('chiclet_my_persistent_peer_id');
      if (savedCode) {
        finalId = savedCode;
      } else {
        const randNum = Math.floor(1000 + Math.random() * 9000);
        finalId = `chic_${sanitizedName}_${randNum}`;
        localStorage.setItem('chiclet_my_persistent_peer_id', finalId);
      }
    }

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer(finalId, {
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
              { urls: 'stun:stun3.l.google.com:19302' },
              { urls: 'stun:stun4.l.google.com:19302' },
              { urls: 'stun:stun.services.mozilla.com' },
              { urls: 'stun:stun.cloudflare.com:3478' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });

        this.peer.on('open', (id) => {
          this.peerId = id;
          this.isInitialized = true;
          this.onReadyCallbacks.forEach(cb => {
            try { cb(id); } catch (_) {}
          });
          resolve(id);
        });

        this.peer.on('connection', (conn) => {
          this.setupDataConnection(conn);
        });

        this.peer.on('call', async (call) => {
          const mode = call.metadata?.mode || 'video';
          const callerName = call.metadata?.username || this.peersInfo.get(call.peer)?.username || 'Arkadaş';
          this.peersInfo.set(call.peer, { username: callerName, peerId: call.peer });

          let streamToAnswer = this.localStream;
          if (!streamToAnswer && navigator.mediaDevices?.getUserMedia) {
            try {
              if (mode === 'video') {
                streamToAnswer = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).catch(() => null);
              }
              if (!streamToAnswer) {
                streamToAnswer = await navigator.mediaDevices.getUserMedia({ audio: true, video: false }).catch(() => null);
              }
              if (streamToAnswer) {
                this.localStream = streamToAnswer;
              }
            } catch (_) {}
          }

          if (streamToAnswer) {
            call.answer(streamToAnswer);
          } else {
            call.answer();
          }

          call.on('stream', (remoteStream) => {
            this.notifyStream(call.peer, remoteStream, callerName, mode);
          });

          this.mediaCalls.set(call.peer, call);
        });

        this.peer.on('error', (err) => {
          console.warn('[P2P] PeerJS Uyarısı:', err?.type || err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  connectToPeerAsync(targetPeerId) {
    if (!this.peer || !targetPeerId) return Promise.resolve({ success: false, error: 'Oturum henüz hazır değil' });
    const cleanTargetId = targetPeerId.trim();
    if (cleanTargetId === this.peerId) return Promise.resolve({ success: false, error: 'Kendi oda kodunuza bağlanamazsınız' });

    if (this.connections.has(cleanTargetId) && this.connections.get(cleanTargetId).open) {
      return Promise.resolve({ success: true });
    }

    return new Promise((resolve) => {
      let isResolved = false;
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          resolve({ success: false, error: 'Bağlantı zaman aşımına uğradı. Kodun doğruluğunu kontrol edin.' });
        }
      }, 10000);

      try {
        const conn = this.peer.connect(cleanTargetId, {
          reliable: true,
          metadata: { username: this.username }
        });

        this.setupDataConnection(conn);

        conn.on('open', () => {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            resolve({ success: true });
          }
        });

        conn.on('error', (err) => {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            resolve({ success: false, error: err?.type || 'Bağlantı kurulamadı' });
          }
        });
      } catch (e) {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeout);
          resolve({ success: false, error: e.message });
        }
      }
    });
  }

  connectToPeer(targetPeerId) {
    this.connectToPeerAsync(targetPeerId);
    return true;
  }

  setupDataConnection(conn) {
    const handleOpen = () => {
      this.connections.set(conn.peer, conn);
      const remoteUsername = conn.metadata?.username || 'Arkadaş';
      this.peersInfo.set(conn.peer, { username: remoteUsername, connectedAt: Date.now() });

      // Handshake
      try {
        conn.send({
          type: 'HANDSHAKE',
          username: this.username,
          peerId: this.peerId
        });
      } catch (_) {}

      this.onPeerJoinCallbacks.forEach(cb => {
        try { cb(conn.peer, remoteUsername); } catch (_) {}
      });
    };

    if (conn.open) {
      handleOpen();
    } else {
      conn.on('open', handleOpen);
    }

    conn.on('data', (raw) => {
      // Chunk Reassembly
      if (raw && raw.__chiclet_chunk__) {
        const { chunkId, index, total, data } = raw;
        if (!this.incomingChunks.has(chunkId)) {
          this.incomingChunks.set(chunkId, { total, received: 0, parts: new Array(total) });
        }
        const tracker = this.incomingChunks.get(chunkId);
        tracker.parts[index] = data;
        tracker.received++;

        if (tracker.received === tracker.total) {
          const fullJson = tracker.parts.join('');
          this.incomingChunks.delete(chunkId);
          try {
            const parsed = JSON.parse(fullJson);
            this.handleParsedData(parsed, conn);
          } catch (_) {}
        }
        return;
      }

      this.handleParsedData(raw, conn);
    });

    conn.on('close', () => {
      const info = this.peersInfo.get(conn.peer);
      this.connections.delete(conn.peer);
      this.peersInfo.delete(conn.peer);
      this.onPeerLeaveCallbacks.forEach(cb => {
        try { cb(conn.peer, info?.username || 'Arkadaş'); } catch (_) {}
      });
    });

    conn.on('error', () => {
      this.connections.delete(conn.peer);
    });
  }

  handleParsedData(data, conn) {
    if (!data) return;

    if (data.type === 'HANDSHAKE') {
      if (data.username) {
        this.peersInfo.set(conn.peer, { username: data.username, peerId: data.peerId });
        this.onPeerJoinCallbacks.forEach(cb => {
          try { cb(conn.peer, data.username); } catch (_) {}
        });
      }
      return;
    }

    this.onMessageCallbacks.forEach(cb => {
      try { cb(data, conn.peer); } catch (_) {}
    });
  }

  sendToConn(conn, payload) {
    if (!conn || !conn.open) return;
    try {
      const json = JSON.stringify(payload);
      if (json.length <= CHUNK_SIZE) {
        conn.send(payload);
      } else {
        const total = Math.ceil(json.length / CHUNK_SIZE);
        const chunkId = Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        for (let i = 0; i < total; i++) {
          const chunkData = json.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
          conn.send({
            __chiclet_chunk__: true,
            chunkId,
            index: i,
            total,
            data: chunkData
          });
        }
      }
    } catch (_) {}
  }

  broadcast(payload) {
    this.connections.forEach((conn) => {
      this.sendToConn(conn, payload);
    });
  }

  callAllPeers(localStream, mode = 'video') {
    if (!this.peer) return;
    if (localStream) this.localStream = localStream;

    this.broadcast({
      type: 'INCOMING_CALL',
      mode,
      caller: this.username,
      callerPeerId: this.peerId
    });

    if (this.localStream) {
      this.connections.forEach((conn, peerId) => {
        try {
          const call = this.peer.call(peerId, this.localStream, {
            metadata: { mode, username: this.username }
          });
          call.on('stream', (remoteStream) => {
            const info = this.peersInfo.get(peerId);
            this.notifyStream(peerId, remoteStream, info?.username || 'Arkadaş', mode);
          });
          this.mediaCalls.set(peerId, call);
        } catch (_) {}
      });
    }
  }

  notifyStream(peerId, remoteStream, username, mode = 'video') {
    this.onStreamCallbacks.forEach(cb => {
      try { cb(peerId, remoteStream, username, mode); } catch (_) {}
    });
  }

  onMessage(cb) {
    this.onMessageCallbacks.push(cb);
    return () => {
      this.onMessageCallbacks = this.onMessageCallbacks.filter(c => c !== cb);
    };
  }

  onRemoteStream(cb) {
    this.onStreamCallbacks.push(cb);
    return () => {
      this.onStreamCallbacks = this.onStreamCallbacks.filter(c => c !== cb);
    };
  }

  onPeerJoin(cb) {
    this.onPeerJoinCallbacks.push(cb);
    return () => {
      this.onPeerJoinCallbacks = this.onPeerJoinCallbacks.filter(c => c !== cb);
    };
  }

  onPeerLeave(cb) {
    this.onPeerLeaveCallbacks.push(cb);
    return () => {
      this.onPeerLeaveCallbacks = this.onPeerLeaveCallbacks.filter(c => c !== cb);
    };
  }

  onReady(cb) {
    if (this.peerId && this.isInitialized) {
      cb(this.peerId);
    } else {
      this.onReadyCallbacks.push(cb);
    }
  }

  getConnectedPeers() {
    return Array.from(this.peersInfo.entries()).map(([peerId, info]) => ({
      peerId,
      username: info.username
    }));
  }

  disconnectAll() {
    try {
      this.broadcast({
        type: 'LEAVE_CHAT',
        username: this.username
      });
    } catch (_) {}

    this.connections.forEach(conn => {
      try { conn.close(); } catch (_) {}
    });
    this.mediaCalls.forEach(call => {
      try { call.close(); } catch (_) {}
    });
    this.connections.clear();
    this.peersInfo.clear();
    this.mediaCalls.clear();
    if (this.localStream) {
      try {
        this.localStream.getTracks().forEach(t => t.stop());
      } catch (_) {}
      this.localStream = null;
    }
  }

  destroy() {
    this.disconnectAll();
    if (this.peer) this.peer.destroy();
    this.peer = null;
    this.peerId = null;
    this.isInitialized = false;
  }
}

export const p2pService = new P2PService();
export default p2pService;
