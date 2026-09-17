import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic, MicOff, Video, VideoOff, Maximize2, Minimize2,
  Sparkles, Pin, X, Smile, Sticker, Send, Settings, UserMinus,
  Layers, Volume2, VolumeX, Eye, EyeOff
} from 'lucide-react';

const CAM_FILTERS = [
  { id: 'none', label: 'Normal', css: 'none' },
  { id: 'cyber', label: 'Neon Cyber', css: 'contrast(130%) saturate(160%) hue-rotate(330deg) drop-shadow(0 0 8px rgba(244,63,94,0.4))' },
  { id: 'vhs', label: 'VHS Retro', css: 'sepia(30%) contrast(120%) saturate(140%)' },
  { id: 'matrix', label: 'Matrix Glow', css: 'hue-rotate(90deg) contrast(140%) brightness(110%)' },
  { id: 'noir', label: 'B&W Noir', css: 'grayscale(100%) contrast(150%)' },
  { id: 'dream', label: 'Soft Pastel', css: 'brightness(115%) saturate(120%) contrast(90%)' }
];

export default function FloatingVideoTile({
  participant,
  isSelf = false,
  isDetached = false,
  activeFilter = 'none',
  onToggleMute,
  onToggleCam,
  onSendSpeech,
  onSendSticker,
  currentTheme,
  speechBubbles = [],
  floatingStickers = [],
  onDockBack
}) {
  const [pos, setPos] = useState(participant.initialPos || { x: isSelf ? 20 : window.innerWidth - 280, y: 30 });
  const [size, setSize] = useState({ w: 260, h: 175 });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(activeFilter);
  const [inputText, setInputText] = useState('');

  const videoRef = useRef(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const tileRef = useRef(null);

  const accentColor = currentTheme?.accentColor || '#6366f1';

  //WebCam & P2P 
  useEffect(() => {
    if (participant.stream && videoRef.current) {
      if (videoRef.current.srcObject !== participant.stream) {
        videoRef.current.srcObject = participant.stream;
      }
      videoRef.current.play().catch(() => {});
    } else if (isSelf && participant.isCamOn && navigator.mediaDevices?.getUserMedia) {
      let stream = null;
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(() => {});
          }
        })
        .catch(() => {});

      return () => {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      };
    }
  }, [isSelf, participant.isCamOn, participant.stream]);

  // global drag flag 
  const onTileMouseDown = useCallback((e) => {
    if (!isDetached || e.target.closest('button') || e.target.closest('input')) return;
    e.preventDefault();
    dragging.current = true;
    window.__startDrag?.(); 
    const rect = tileRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const onMove = (ev) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - size.w, ev.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - size.h, ev.clientY - dragOffset.current.y))
      });
    };

    const onUp = () => {
      dragging.current = false;
      window.__endDrag?.();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [isDetached, size]);

  const handleSendSpeech = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendSpeech(participant.id, inputText.trim());
    setInputText('');
  };

  const currentFilterCss = CAM_FILTERS.find(f => f.id === selectedFilter)?.css || 'none';

  return (
    <div
      data-chiclet="true"
      ref={tileRef}
      onMouseDown={onTileMouseDown}
      style={{
        position: isDetached ? 'fixed' : 'relative',
        left: isDetached ? `${pos.x}px` : 'auto',
        top: isDetached ? `${pos.y}px` : 'auto',
        width: isDetached ? `${size.w}px` : '100%',
        height: isDetached ? `${size.h}px` : '165px',
        minHeight: '150px',
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '14px',
        border: participant.isSpeaking ? `2px solid #22c55e` : `1px solid rgba(255,255,255,0.15)`,
        boxShadow: participant.isSpeaking
          ? '0 0 20px rgba(34,197,94,0.4), 0 8px 24px rgba(0,0,0,0.3)'
          : '0 6px 20px rgba(0,0,0,0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zIndex: isDetached ? 9999 : 10,
        cursor: isDetached ? 'grab' : 'default',
        pointerEvents: 'auto',
        transition: 'border 0.2s, box-shadow 0.2s',
        flexShrink: 0
      }}
    >
      {}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent'
      }}>
        {/* Live Video / Avatar */}
        {participant.isCamOn ? (
          (isSelf || participant.stream) ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isSelf}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transform: isSelf ? 'scaleX(-1)' : 'none',
                filter: currentFilterCss
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: `radial-gradient(ellipse at center, rgba(99, 102, 241, 0.25) 0%, transparent 80%)`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              filter: currentFilterCss
            }}>
              <div style={{
                width: '54px', height: '54px', borderRadius: '50%',
                background: participant.avatarBg || '#6366f1',
                color: '#fff', fontSize: '20px', fontWeight: 'bold',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px rgba(99,102,241,0.4)',
                border: '2px solid rgba(255,255,255,0.2)'
              }}>
                {participant.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '5px' }}>
                HD Canlı Video
              </span>
            </div>
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
            <VideoOff size={24} />
            <span style={{ fontSize: '10px' }}>Kamera Kapalı</span>
          </div>
        )}

        {}
        <div style={{
          position: 'absolute',
          top: '32px',
          left: '6px',
          bottom: '8px',
          width: '36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '4px',
          pointerEvents: 'none',
          zIndex: 30
        }}>
          {floatingStickers.map(stk => (
            <div
              key={stk.id}
              className="sticker-float-inside"
              style={{
                fontSize: '22px',
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.85))',
                userSelect: 'none'
              }}
            >
              {stk.emoji}
            </div>
          ))}
        </div>

        {}
        <div style={{
          position: 'absolute',
          top: '24px',
          right: '8px',
          bottom: '22px',
          width: '65%',
          maxWidth: '170px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: '6px',
          pointerEvents: 'none',
          zIndex: 30
        }}>
          {speechBubbles.map(bubble => (
            <div
              key={bubble.id}
              className="speech-bubble-wobble"
              style={{
                background: isSelf
                  ? 'rgba(79, 70, 229, 0.72)'
                  : 'rgba(15, 23, 42, 0.72)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px 12px 4px 12px',
                padding: '5px 8px',
                boxShadow: '0 6px 18px rgba(0,0,0,0.45)',
                color: '#fff',
                fontSize: '10.5px',
                lineHeight: '1.35',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                alignSelf: 'flex-end',
                maxWidth: '100%',
                wordBreak: 'break-word'
              }}
            >
              <div style={{ fontWeight: '700', fontSize: '8.5px', color: '#cbd5e1', marginBottom: '1px' }}>
                @{bubble.sender}
              </div>
              <div>{bubble.text}</div>
            </div>
          ))}
        </div>

        {}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '5px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 100%)',
          zIndex: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{
              fontSize: '9.5px', fontWeight: '700', color: '#fff',
              background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              {isSelf ? `Sen (@${participant.name})` : `@${participant.name}`}
            </span>
            {participant.isSpeaking && (
              <span style={{ fontSize: '8.5px', color: '#4ade80', fontWeight: 'bold', background: 'rgba(34,197,94,0.25)', padding: '1px 4px', borderRadius: '4px' }}>
                Konuşuyor
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              title="Kamera Efekti Seç"
              style={{
                background: selectedFilter !== 'none' ? 'rgba(168,85,247,0.35)' : 'rgba(0,0,0,0.35)',
                border: `1px solid ${selectedFilter !== 'none' ? '#a855f7' : 'rgba(255,255,255,0.15)'}`,
                color: selectedFilter !== 'none' ? '#c084fc' : '#cbd5e1',
                borderRadius: '5px', padding: '2px 4px', cursor: 'pointer', fontSize: '9.5px',
                display: 'flex', alignItems: 'center', gap: '2px'
              }}
            >
              <Sparkles size={9} /> Efekt
            </button>

            {isDetached && (
              <button
                onClick={onDockBack}
                title="Sohbetin Yanına Birleştir"
                style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  color: '#cbd5e1', borderRadius: '5px', padding: '2px 4px', cursor: 'pointer'
                }}
              >
                <Minimize2 size={10} />
              </button>
            )}
          </div>
        </div>

        {}
        {isFilterMenuOpen && (
          <div style={{
            position: 'absolute', top: '28px', right: '8px', zIndex: 40,
            background: 'rgba(15, 20, 32, 0.95)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px', padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.8)'
          }}>
            {CAM_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => { setSelectedFilter(f.id); setIsFilterMenuOpen(false); }}
                style={{
                  background: selectedFilter === f.id ? `${accentColor}30` : 'transparent',
                  border: selectedFilter === f.id ? `1px solid ${accentColor}` : 'none',
                  color: selectedFilter === f.id ? '#fff' : '#94a3b8',
                  borderRadius: '4px', padding: '2px 6px', fontSize: '9.5px', cursor: 'pointer', textAlign: 'left'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {}
      <div style={{
        padding: '4px 6px',
        background: 'rgba(0,0,0,0.25)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '3px'
      }}>
        {/* Sticker Buttons */}
        <button
          onClick={() => onSendSticker(participant.id, '🔥')}
          title="🔥 Alev Fırlat"
          style={{ background: 'transparent', border: 'none', fontSize: '12px', cursor: 'pointer', padding: '1px' }}
        >
          🔥
        </button>
        <button
          onClick={() => onSendSticker(participant.id, '❤️')}
          title="❤️ Kalp Fırlat"
          style={{ background: 'transparent', border: 'none', fontSize: '12px', cursor: 'pointer', padding: '1px' }}
        >
          ❤️
        </button>
        <button
          onClick={() => onSendSticker(participant.id, '🎮')}
          title="🎮 Oyun İkonu Fırlat"
          style={{ background: 'transparent', border: 'none', fontSize: '12px', cursor: 'pointer', padding: '1px' }}
        >
          🎮
        </button>

        {}
        <form onSubmit={handleSendSpeech} style={{ flex: 1, display: 'flex', gap: '2px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Baloncuğa yaz..."
            style={{
              flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '5px', padding: '2px 5px', color: '#fff', fontSize: '9.5px', outline: 'none'
            }}
          />
          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
              color: '#fff', borderRadius: '5px', padding: '2px 5px', cursor: 'pointer', display: 'flex', alignItems: 'center'
            }}
          >
            <Send size={9} />
          </button>
        </form>
      </div>
    </div>
  );
}
