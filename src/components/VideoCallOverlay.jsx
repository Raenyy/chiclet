import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, UserPlus, Eye, EyeOff, Minus, X, SplitSquareVertical, LayoutGrid } from 'lucide-react';
import { p2pService } from '../services/P2PService';
import FloatingVideoTile from './FloatingVideoTile.jsx';

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

  const [participants, setParticipants] = useState([
    {
      id: 'self',
      name: user || 'Sen',
      isSelf: true,
      isCamOn: true,
      isMicMuted: false,
      isSpeaking: false,
      avatarBg: '#6366f1',
      initialPos: { x: 50, y: 60 }
    }
  ]);

  // Canlı P2P Video/Ses Arama Akışları
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
        if (existing) {
          return prev.map(p => p.id === peerId ? { ...p, stream: remoteStream, name: remoteUsername || p.name } : p);
        }
        return [
          ...prev,
          {
            id: peerId,
            name: remoteUsername || 'Arkadaş',
            isSelf: false,
            isCamOn: true,
            isMicMuted: false,
            isSpeaking: false,
            avatarBg: '#22c55e',
            stream: remoteStream,
            initialPos: { x: Math.max(20, window.innerWidth - 300), y: 60 }
          }
        ];
      });
    });

    const unsubLeave = p2pService.onPeerLeave((peerId) => {
      setParticipants(prev => prev.filter(p => p.id !== peerId));
    });

    return () => {
      unsubStream();
      unsubLeave();
      if (myStream) {
        myStream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const [speechBubblesMap, setSpeechBubblesMap] = useState({});
  const [floatingStickersMap, setFloatingStickersMap] = useState({});

  const accentColor = currentTheme?.accentColor || '#6366f1';
  const windowRgb = currentTheme?.windowRgb || '13, 17, 28';

  if (!isOpen) return null;

  const handleInviteToChat = () => {
    onSendVideoInviteToChat?.();
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 3000);
  };

  const handleSendSpeech = (participantId, text) => {
    const newBubble = { id: Date.now(), text, sender: participantId === 'self' ? (user || 'Sen') : 'Arkadaş' };
    setSpeechBubblesMap(prev => ({
      ...prev,
      [participantId]: [...(prev[participantId] || []).slice(-2), newBubble]
    }));
    setTimeout(() => setSpeechBubblesMap(prev => ({
      ...prev,
      [participantId]: (prev[participantId] || []).filter(b => b.id !== newBubble.id)
    })), 6000);
  };

  const handleSendSticker = (participantId, emoji) => {
    const newStk = { id: Date.now(), emoji };
    setFloatingStickersMap(prev => ({
      ...prev,
      [participantId]: [...(prev[participantId] || []).slice(-3), newStk]
    }));
    setTimeout(() => setFloatingStickersMap(prev => ({
      ...prev,
      [participantId]: (prev[participantId] || []).filter(s => s.id !== newStk.id)
    })), 2400);
  };

  // ─── AYRILMIŞ MOD: createPortal ile document.body'ye bağlanır (ChatWindow'dan tamamen bağımsız) ───
  if (isDetached) {
    return createPortal(
      <>
        {/* Küçük kontrol çubuğu — TÜM EKRANIN ALTINDA HAFİF VE ŞIK ORTALANIR */}
        <div
          data-chiclet="true"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '14px',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 10px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.2)',
            zIndex: 99999,
            pointerEvents: 'auto',
            userSelect: 'none'
          }}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', flexShrink: 0, boxShadow: '0 0 8px #4ade80' }} />
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>Ayrılmış Pencereler</span>

          <button
            onClick={() => onToggleDetached?.(false)}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
              whiteSpace: 'nowrap'
            }}
          >
            <LayoutGrid size={11} color="#ffffff" />
            <span>Birleştir</span>
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
              whiteSpace: 'nowrap'
            }}
          >
            <PhoneOff size={11} color="#ffffff" />
            <span>Bitir</span>
          </button>
        </div>

        {/* Serbest kamera kutucukları — tüm ekranda bağımsız hareket eder, chat ile hareket etmez */}
        {participants.map(p => {
          if (p.isSelf && !isSelfVisible) return null;
          return (
            <FloatingVideoTile
              key={p.id}
              participant={{ ...p, isCamOn: p.isSelf ? isCamOn : p.isCamOn }}
              isSelf={p.isSelf}
              isDetached={true}
              speechBubbles={speechBubblesMap[p.id] || []}
              floatingStickers={floatingStickersMap[p.id] || []}
              onSendSpeech={handleSendSpeech}
              onSendSticker={handleSendSticker}
              currentTheme={currentTheme}
              onDockBack={() => onToggleDetached?.(false)}
            />
          );
        })}
      </>,
      document.body
    );
  }

  // ─── NORMAL MOD: chat penceresine kenetli panel ────────────────────────────
  return (
    <div
      data-chiclet="true"
      style={{
        width: '280px', minWidth: '280px', maxWidth: '280px', height: '100%',
        background: `rgba(${windowRgb}, 0.55)`,
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', color: '#f1f5f9', pointerEvents: 'auto',
        animation: 'slideInFromRight 0.28s cubic-bezier(0.16,1,0.3,1)'
      }}
    >
      {/* ÜST BAR */}
      <div style={{
        padding: '8px 12px', background: 'rgba(0,0,0,0.3)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '18px', height: '18px', borderRadius: '5px',
            background: 'linear-gradient(135deg,#22c55e,#10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Video size={10} color="#fff" />
          </div>
          <span style={{ fontSize: '11.5px', fontWeight: '800' }}>Kamera</span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {onMinimize && (
            <button onClick={() => { setIsCamOn(false); onMinimize(); }} title="Küçült" style={smallBtn}>
              <Minus size={11} />
            </button>
          )}
          <button onClick={onClose} title="Kapat" style={{ ...smallBtn, color: '#f87171' }}>
            <X size={12} />
          </button>
        </div>
      </div>

      {/* KAMERA KUTULARI */}
      <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', minHeight: 0 }}>
        {participants.map(p => {
          if (p.isSelf && !isSelfVisible) return null;
          return (
            <FloatingVideoTile
              key={p.id}
              participant={{ ...p, isCamOn: p.isSelf ? isCamOn : p.isCamOn }}
              isSelf={p.isSelf}
              isDetached={false}
              speechBubbles={speechBubblesMap[p.id] || []}
              floatingStickers={floatingStickersMap[p.id] || []}
              onSendSpeech={handleSendSpeech}
              onSendSticker={handleSendSticker}
              currentTheme={currentTheme}
            />
          );
        })}
      </div>

      {/* ALT KONTROL */}
      <div style={{
        padding: '7px 10px', background: 'rgba(0,0,0,0.35)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => setIsMicMuted(!isMicMuted)} style={{
              ...controlBtn,
              background: isMicMuted ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)',
              border: isMicMuted ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
              color: isMicMuted ? '#f87171' : '#fff',
            }}>
              {isMicMuted ? <MicOff size={10} /> : <Mic size={10} />}
              <span>{isMicMuted ? 'Sessiz' : 'Mik'}</span>
            </button>

            <button onClick={() => setIsCamOn(!isCamOn)} style={{
              ...controlBtn,
              background: !isCamOn ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)',
              border: !isCamOn ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
              color: !isCamOn ? '#f87171' : '#fff',
            }}>
              {!isCamOn ? <VideoOff size={10} /> : <Video size={10} />}
              <span>{isCamOn ? 'Açık' : 'Kapalı'}</span>
            </button>

            <button onClick={() => setIsSelfVisible(!isSelfVisible)} style={{
              ...controlBtn, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1'
            }}>
              {isSelfVisible ? <Eye size={10} /> : <EyeOff size={10} />}
            </button>
          </div>

          <button onClick={handleInviteToChat} style={{
            ...controlBtn,
            background: inviteSent ? 'rgba(34,197,94,0.2)' : 'rgba(56,189,248,0.15)',
            border: `1px solid ${inviteSent ? '#22c55e' : 'rgba(56,189,248,0.3)'}`,
            color: inviteSent ? '#4ade80' : '#38bdf8',
          }}>
            <UserPlus size={10} />
            {inviteSent ? '✓ Davet' : 'Davet'}
          </button>
        </div>

        {/* Pencereleri Ayır + Görüşmeyi Bitir — yan yana */}
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => onToggleDetached?.(true)}
            style={{
              flex: 1, padding: '5px',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              border: 'none', color: '#fff', borderRadius: '6px',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '3px', fontSize: '9.5px', fontWeight: '700'
            }}
          >
            <SplitSquareVertical size={10} /> Ayır
          </button>

          <button onClick={onClose} style={{
            flex: 1, padding: '5px',
            background: 'linear-gradient(135deg,#dc2626,#b91c1c)',
            border: 'none', color: '#fff', borderRadius: '6px',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '3px', fontSize: '9.5px', fontWeight: '700'
          }}>
            <PhoneOff size={10} /> Bitir
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

const smallBtn = {
  background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8',
  borderRadius: '5px', padding: '3px 5px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};
const controlBtn = {
  padding: '3px 7px', borderRadius: '6px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: '3px',
  fontSize: '9.5px', fontWeight: '600', border: 'none'
};
const ctrlBtn = {
  border: 'none', color: '#fff', borderRadius: '6px', padding: '3px 9px',
  fontSize: '10.5px', fontWeight: '700', cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: '4px'
};
