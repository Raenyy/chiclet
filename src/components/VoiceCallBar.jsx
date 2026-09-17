import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Headphones, PhoneOff, Video, UserPlus, Signal, ChevronUp } from 'lucide-react';
import { p2pService } from '../services/P2PService';

export default function VoiceCallBar({ user, onEndCall, onSwitchToVideo, onMinimizePanel, onSendVoiceInviteToChat, isVisible = true }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [remoteAudioStreams, setRemoteAudioStreams] = useState([]);
  const localStreamRef = useRef(null);

  const [voiceParticipants, setVoiceParticipants] = useState([
    { id: 'self', name: user || 'Sen', isSelf: true, avatarBg: '#6366f1' }
  ]);

  useEffect(() => {
    let audioStream = null;
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(stream => {
          audioStream = stream;
          localStreamRef.current = stream;
          setIsSpeaking(true);
          p2pService.callAllPeers(stream, 'voice');
        })
        .catch(() => {});
    }

    const unsubStream = p2pService.onRemoteStream((peerId, stream, remoteUsername) => {
      setRemoteAudioStreams(prev => {
        const filtered = prev.filter(s => s.peerId !== peerId);
        return [...filtered, { peerId, stream }];
      });
      setVoiceParticipants(prev => {
        const existing = prev.find(p => p.id === peerId);
        if (existing) return prev;
        return [...prev, { id: peerId, name: remoteUsername || 'Arkadas', isSelf: false, avatarBg: '#22c55e' }];
      });
    });

    const unsubJoin = p2pService.onPeerJoin((peerId, remoteUsername) => {
      setVoiceParticipants(prev => {
        const existing = prev.find(p => p.id === peerId);
        if (existing) return prev;
        return [...prev, { id: peerId, name: remoteUsername || 'Arkadas', isSelf: false, avatarBg: '#22c55e' }];
      });
    });

    const unsubLeave = p2pService.onPeerLeave((peerId) => {
      setVoiceParticipants(prev => prev.filter(p => p.id !== peerId));
      setRemoteAudioStreams(prev => prev.filter(s => s.peerId !== peerId));
    });

    return () => {
      unsubStream();
      unsubJoin();
      unsubLeave();
      if (audioStream) {
        audioStream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleInviteToChat = () => {
    if (onSendVoiceInviteToChat) {
      onSendVoiceInviteToChat();
    }
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 3000);
  };

  return (
    <div style={{
      display: isVisible ? 'flex' : 'none',
      background: 'rgba(0,0,0,0.4)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      padding: '8px 12px',
      flexDirection: 'column',
      gap: '7px',
      flexShrink: 0
    }}>
      {/* Top info bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', display: 'inline-block' }} />
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#4ade80', letterSpacing: '0.4px' }}>
            Sesli Bağlantı Aktif
          </span>
          <span style={{ fontSize: '10px', color: '#475569' }}>
            ({formatTime(callDuration)})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: '#4ade80' }}>
            <Signal size={11} color="#4ade80" />
            <span>HD Ses</span>
          </div>
          <button
            onClick={onMinimizePanel}
            title="Paneli Gizle"
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#64748b', borderRadius: '6px', padding: '3px 7px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px',
            }}
          >
            <ChevronUp size={12} />
            Gizle
          </button>
        </div>
      </div>

      {/* Participant bubbles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0', overflowX: 'auto' }}>
        {voiceParticipants.map((p) => {
          const speaking = p.isSelf ? isSpeaking : Math.random() > 0.5;
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: speaking ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '20px',
              border: speaking ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.08)',
              transition: 'all 0.2s', flexShrink: 0
            }}>
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%',
                background: p.avatarBg,
                color: '#fff', fontSize: '9px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative'
              }}>
                {p.name.charAt(0).toUpperCase()}
                {speaking && (
                  <span style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: '2px solid #22c55e', animation: 'pulse 1.2s infinite' }} />
                )}
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                {p.isSelf ? `@${p.name}` : p.name}
              </span>
              {p.isSelf && isMuted && <MicOff size={11} color="#ef4444" />}
            </div>
          );
        })}

        {/* Invite to chat button */}
        <button
          onClick={handleInviteToChat}
          title="Sohbete Sesli Aramaya Katilma Karti Gonder"
          style={{
            background: inviteSent ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)',
            border: `1px ${inviteSent ? 'solid rgba(34,197,94,0.4)' : 'dashed rgba(255,255,255,0.15)'}`,
            color: inviteSent ? '#4ade80' : '#64748b',
            borderRadius: '20px', padding: '3px 9px',
            fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
            flexShrink: 0, transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { if (!inviteSent) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; } }}
          onMouseLeave={(e) => { if (!inviteSent) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; } }}
        >
          <UserPlus size={11} />
          {inviteSent ? 'Davet Edildi' : 'Davet Et'}
        </button>
      </div>

      {/* Audio controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Mikrofonu Ac' : 'Mikrofonu Kapat'}
            style={{
              background: isMuted ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)',
              border: isMuted ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.1)',
              color: isMuted ? '#f87171' : '#64748b',
              padding: '4px 8px', borderRadius: '7px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px',
            }}
          >
            {isMuted ? <MicOff size={12} /> : <Mic size={12} />}
            <span>{isMuted ? 'Sessiz' : 'Mikrofon'}</span>
          </button>

          <button
            onClick={() => setIsDeafened(!isDeafened)}
            title={isDeafened ? 'Sesi Ac' : 'Kulanligi Kapat'}
            style={{
              background: isDeafened ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)',
              border: isDeafened ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.1)',
              color: isDeafened ? '#f87171' : '#64748b',
              padding: '4px 8px', borderRadius: '7px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px',
            }}
          >
            <Headphones size={12} />
            <span>{isDeafened ? 'Sagir' : 'Kulaklik'}</span>
          </button>

          <button
            onClick={onSwitchToVideo}
            title="Goruntuluye Gec"
            style={{
              background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
              color: '#818cf8', padding: '4px 8px', borderRadius: '7px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px',
            }}
          >
            <Video size={12} />
            <span>Kamera</span>
          </button>
        </div>

        <button
          onClick={onEndCall}
          title="Aramayi Sonlandir"
          style={{
            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
            border: 'none', borderRadius: '7px',
            color: '#fff', padding: '4px 10px', fontSize: '11px', fontWeight: '600',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          <PhoneOff size={12} />
          <span>Ayrıl</span>
        </button>
      </div>

      {/* Hidden audio elements for remote peers */}
      {remoteAudioStreams.map(item => (
        <audio
          key={item.peerId}
          autoPlay
          muted={isDeafened}
          ref={el => {
            if (el && item.stream && el.srcObject !== item.stream) {
              el.srcObject = item.stream;
            }
          }}
        />
      ))}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.25); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}