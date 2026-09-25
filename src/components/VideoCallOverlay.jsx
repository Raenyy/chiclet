import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LayoutGrid } from 'lucide-react';
import { p2pService } from '../services/P2PService';
import FloatingVideoTile from './FloatingVideoTile.jsx';
import MikrofonIcon from '../assets/MikrofonIcon.png';
import KameraIcon from '../assets/KameraIcon.png';

export default function VideoCallOverlay({
  user,
  isOpen = false,
  onClose,
  onMinimize,
  currentTheme,
  onSendVideoInviteToChat,
  isDetached = false,
  onToggleDetached,
}) {
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isSelfVisible, setIsSelfVisible] = useState(true);
  const [inviteSent, setInviteSent] = useState(false);

  const [participants, setParticipants] = useState([{
    id: 'self', name: user || 'Sen', isSelf: true,
    isCamOn: true, isMicMuted: false, isSpeaking: false,
    avatarBg: '#6366f1', initialPos: { x: 50, y: 60 }
  }]);

  useEffect(() => {
    let myStream = null;
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          myStream = stream;
          setParticipants(prev => prev.map(p => p.id === 'self' ? { ...p, stream } : p));
          p2pService.callAllPeers(stream, 'video');
        })
        .catch(() => {
          navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(audioStream => {
              myStream = audioStream;
              setParticipants(prev => prev.map(p => p.id === 'self' ? { ...p, stream: audioStream, isCamOn: false } : p));
              p2pService.callAllPeers(audioStream, 'video');
            })
            .catch(() => {});
        });
    }

    const unsubStream = p2pService.onRemoteStream((peerId, remoteStream, remoteUsername) => {
      setParticipants(prev => {
        const existing = prev.find(p => p.id === peerId);
        if (existing) return prev.map(p => p.id === peerId ? { ...p, stream: remoteStream, name: remoteUsername || p.name } : p);
        return [...prev, { id: peerId, name: remoteUsername || 'Arkadas', isSelf: false, isCamOn: true, isMicMuted: false, isSpeaking: false, avatarBg: '#22c55e', stream: remoteStream, initialPos: { x: Math.max(20, window.innerWidth - 300), y: 60 } }];
      });
    });

    const unsubLeave = p2pService.onPeerLeave((peerId) => {
      setParticipants(prev => prev.filter(p => p.id !== peerId));
    });

    return () => {
      unsubStream();
      unsubLeave();
      if (myStream) myStream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const [speechBubblesMap, setSpeechBubblesMap] = useState({});
  const [floatingStickersMap, setFloatingStickersMap] = useState({});

  if (!isOpen) return null;

  const handleInviteToChat = () => {
    onSendVideoInviteToChat?.();
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 3000);
  };

  const handleSendSpeech = (participantId, text) => {
    const newBubble = { id: Date.now(), text, sender: participantId === 'self' ? (user || 'Sen') : 'Arkadas' };
    setSpeechBubblesMap(prev => ({ ...prev, [participantId]: [...(prev[participantId] || []).slice(-2), newBubble] }));
    setTimeout(() => setSpeechBubblesMap(prev => ({ ...prev, [participantId]: (prev[participantId] || []).filter(b => b.id !== newBubble.id) })), 6000);
  };

  const handleSendSticker = (participantId, emoji) => {
    const newStk = { id: Date.now(), emoji };
    setFloatingStickersMap(prev => ({ ...prev, [participantId]: [...(prev[participantId] || []).slice(-3), newStk] }));
    setTimeout(() => setFloatingStickersMap(prev => ({ ...prev, [participantId]: (prev[participantId] || []).filter(s => s.id !== newStk.id) })), 2400);
  };

  const hoverUp = {
    onMouseEnter: e => e.currentTarget.style.transform = 'translateY(-1px)',
    onMouseLeave: e => e.currentTarget.style.transform = '',
    onMouseDown: e => e.currentTarget.style.transform = 'translateY(1px) scale(0.97)',
    onMouseUp: e => e.currentTarget.style.transform = 'translateY(-1px)',
  };

  // ─── AYRILMIŞ MOD ───────────────────────────────────────────────────────────
  if (isDetached) {
    return createPortal(
      <>
        <div data-chiclet="true" style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: '#fce8ef', border: '1.5px solid rgba(220,160,180,0.5)', borderRadius: '20px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 32px rgba(180,100,120,0.18)', zIndex: 99999, pointerEvents: 'auto', userSelect: 'none' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ab0e0', flexShrink: 0 }} />
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#1a1a1a', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>Ayrılmış Pencereler</span>
          <button onClick={() => onToggleDetached?.(false)} style={{ background: 'linear-gradient(to right, #5bc8f5, #4ab0e0)', border: 'none', color: '#fff', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
            <LayoutGrid size={11} color="#fff" />
            <span>Birleştir</span>
          </button>
          <button onClick={onClose} style={{ background: '#fff', border: '1px solid rgba(200,150,170,0.4)', color: '#e05070', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>📵</span>
            <span>Bitir</span>
          </button>
        </div>
        {participants.map(p => {
          if (p.isSelf && !isSelfVisible) return null;
          return (
            <FloatingVideoTile key={p.id}
              participant={{ ...p, isCamOn: p.isSelf ? isCamOn : p.isCamOn }}
              isSelf={p.isSelf} isDetached={true}
              speechBubbles={speechBubblesMap[p.id] || []}
              floatingStickers={floatingStickersMap[p.id] || []}
              onSendSpeech={handleSendSpeech} onSendSticker={handleSendSticker}
              currentTheme={currentTheme} onDockBack={() => onToggleDetached?.(false)}
            />
          );
        })}
      </>,
      document.body
    );
  }

  // ─── NORMAL MOD: 272px kamera paneli ───────────────────────────────────────
  return (
    <div data-chiclet="true" style={{ width: 272, minWidth: 272, maxWidth: 272, height: '100%', background: 'linear-gradient(133deg, rgba(242,174,188,0.80) 0%, rgba(108,8,32,0.80) 100%)', display: 'flex', flexDirection: 'column', overflow: 'hidden', pointerEvents: 'auto', borderRadius: 14, animation: 'slideInFromRight 0.28s cubic-bezier(0.16,1,0.3,1)' }}>

      {/* Kamera titlebar */}
      <div style={{ margin: '12px 7px 0 7px', height: 39, position: 'relative', background: '#F3A6BA', boxShadow: '2px 4px 4px 1px rgba(0,0,0,0.40)', overflow: 'visible', borderRadius: 8, outline: '1px black solid', flexShrink: 0 }}>
        <div style={{ left: 9, top: 12, position: 'absolute', color: 'black', fontSize: 12, fontFamily: 'Poppins', fontWeight: '700' }}>Kamera</div>
        <button onClick={() => { setIsCamOn(false); onMinimize?.(); }} title="Küçült"
          style={{ width: 26, height: 26, left: 185, top: 7, position: 'absolute', background: '#F7D797', boxShadow: '1px 1px 4px rgba(0,0,0,0.30), 0px 2px 2px rgba(0,0,0,0.25) inset', borderRadius: 8, border: '1px black solid', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 15, fontWeight: '900', color: '#1E1E1E', transition: 'transform 0.1s ease' }}
          {...hoverUp}>&#8722;
        </button>
        <button onClick={onClose} title="Kapat"
          style={{ width: 26, height: 26, left: 219, top: 7, position: 'absolute', background: '#F19191', boxShadow: '1px 1px 4px rgba(0,0,0,0.30), 0px 1px 3px rgba(0,0,0,0.25) inset', borderRadius: 8, border: '1px black solid', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 13, fontWeight: '700', color: '#1E1E1E', transition: 'transform 0.1s ease' }}
          {...hoverUp}>&#10005;
        </button>
      </div>

      {/* Kamera görüntü alanı */}
      <div style={{ flex: 1, margin: '8px 7px', background: 'rgba(255,255,255,0.30)', borderRadius: 8, outline: '1px black solid', outlineOffset: '-1px', overflow: 'hidden', position: 'relative', minHeight: 80 }}>
        <div style={{ position: 'absolute', left: 3, top: 3, background: '#FCEDF1', borderRadius: 8, padding: '1px 6px', fontSize: 9, fontFamily: 'Poppins', fontWeight: '500', color: 'black', zIndex: 2 }}>
          @{user || 'kullanici'} (sen)
        </div>
        {participants.map(p => {
          if (p.isSelf && !isSelfVisible) return null;
          return (
            <FloatingVideoTile key={p.id}
              participant={{ ...p, isCamOn: p.isSelf ? isCamOn : p.isCamOn }}
              isSelf={p.isSelf} isDetached={false}
              speechBubbles={speechBubblesMap[p.id] || []}
              floatingStickers={floatingStickersMap[p.id] || []}
              onSendSpeech={handleSendSpeech} onSendSticker={handleSendSticker}
              currentTheme={currentTheme}
            />
          );
        })}
      </div>

      {/* Alt kontrol barı */}
      <div style={{ background: 'rgba(217,217,217,0.60)', padding: '6px 8px 8px 8px', display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          <button onClick={() => setIsMicMuted(!isMicMuted)} title="Mikrofon"
            style={{ flex: 1, height: 26, background: isMicMuted ? '#fecaca' : '#D9D9D9', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, fontSize: 10, fontFamily: 'Poppins', fontWeight: '600', transition: 'transform 0.1s ease' }}
            {...hoverUp}>
            <img src={MikrofonIcon} alt="" style={{ width: 11, height: 11, objectFit: 'contain' }} />
            <span>{isMicMuted ? 'Sessiz' : 'Mikrofon'}</span>
          </button>
          <button onClick={() => setIsCamOn(!isCamOn)} title="Kamera"
            style={{ flex: 1, height: 26, background: !isCamOn ? '#fecaca' : '#D9D9D9', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, fontSize: 10, fontFamily: 'Poppins', fontWeight: '600', transition: 'transform 0.1s ease' }}
            {...hoverUp}>
            <img src={KameraIcon} alt="" style={{ width: 11, height: 11, objectFit: 'contain' }} />
            <span>{isCamOn ? 'Kamera' : 'Kapalı'}</span>
          </button>
          <button onClick={handleInviteToChat} title="Davet"
            style={{ flex: 1, height: 26, background: '#D9D9D9', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, fontSize: 10, fontFamily: 'Poppins', fontWeight: '600', transition: 'transform 0.1s ease' }}
            {...hoverUp}>
            <span>👋</span>
            <span>{inviteSent ? 'Gönderildi' : 'Davet Et'}</span>
          </button>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <button onClick={() => onToggleDetached?.(true)} title="Ayır"
            style={{ flex: 1, height: 26, background: '#D9D9D9', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, fontSize: 10, fontFamily: 'Poppins', fontWeight: '600', transition: 'transform 0.1s ease' }}
            {...hoverUp}>
            <span>⧉</span><span>Ayır</span>
          </button>
          <button onClick={onClose} title="Bitir"
            style={{ flex: 1, height: 26, background: '#fde8e8', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, fontSize: 10, fontFamily: 'Poppins', fontWeight: '600', color: '#b91c1c', transition: 'transform 0.1s ease' }}
            {...hoverUp}>
            <span>📵</span><span>Bitir</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}