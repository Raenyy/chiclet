import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send, Smile, Maximize2, ExternalLink, Sparkles, User, Layers } from 'lucide-react';

export default function VideoCallView({ onCloseCall }) {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [filterEffect, setFilterEffect] = useState('none');
  const [detachedFriendVideo, setDetachedFriendVideo] = useState(false);
  const [detachedMyVideo, setDetachedMyVideo] = useState(false);

  const [speechBubbles, setSpeechBubbles] = useState([
    { id: '1', text: 'Kanka sağ koridoru tutuyorum! 🎮', side: 'right' }
  ]);

  const [floatingStickers, setFloatingStickers] = useState([
    { id: '1', emoji: '🔥', side: 'left' }
  ]);

  const [callInputText, setCallInputText] = useState('');

  const handleSendCallMessage = () => {
    if (!callInputText.trim()) return;
    const newBubble = {
      id: Date.now().toString(),
      text: callInputText,
      side: 'right'
    };
    setSpeechBubbles(prev => [...prev, newBubble]);
    setCallInputText('');

    setTimeout(() => {
      setSpeechBubbles(prev => prev.filter(b => b.id !== newBubble.id));
    }, 4500);
  };

  const handleTriggerSticker = (emoji) => {
    const newSticker = {
      id: Date.now().toString(),
      emoji: emoji,
      side: 'left'
    };
    setFloatingStickers(prev => [...prev, newSticker]);

    setTimeout(() => {
      setFloatingStickers(prev => prev.filter(s => s.id !== newSticker.id));
    }, 3000);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0d14', position: 'relative', overflow: 'hidden' }}>
      {}
      <div style={{
        padding: '8px 14px',
        background: 'rgba(0, 0, 0, 0.5)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#f8fafc' }}>Görüntülü Arama (Grup Odası)</span>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>02:45</span>
        </div>

        {}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>Efekt:</span>
          <select
            value={filterEffect}
            onChange={(e) => setFilterEffect(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              fontSize: '11px',
              borderRadius: '6px',
              padding: '2px 6px',
              outline: 'none'
            }}
          >
            <option value="none" style={{ background: '#0f172a' }}>Normal</option>
            <option value="cyberpunk" style={{ background: '#0f172a' }}>Cyberpunk HUD</option>
            <option value="vhs" style={{ background: '#0f172a' }}>Retro VHS</option>
            <option value="glow" style={{ background: '#0f172a' }}>Neon Glow</option>
          </select>
        </div>
      </div>

      {}
      <div style={{ flex: 1, padding: '12px', display: 'grid', gridTemplateColumns: detachedFriendVideo || detachedMyVideo ? '1fr' : '1fr 1fr', gap: '12px', position: 'relative' }}>
        
        {}
        {!detachedFriendVideo && (
          <div style={{
            position: 'relative',
            borderRadius: '14px',
            overflow: 'hidden',
            background: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: filterEffect === 'cyberpunk' ? 'hue-rotate(90deg) contrast(1.2)' : filterEffect === 'vhs' ? 'sepia(0.3) saturate(1.4)' : 'none'
          }}>
            {}
            <img
              src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=600&q=80"
              alt="Friend Cam"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {}
            <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
              Gamer_Duo (Arkadaşın)
            </div>

            {}
            <button
              onClick={() => setDetachedFriendVideo(true)}
              style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', padding: '4px', borderRadius: '6px', cursor: 'pointer' }}
              title="Kamerayı Ekrandan Ayır (Oyun Köşesine Sabitle)"
            >
              <ExternalLink size={14} />
            </button>

            {}
            <div style={{
              position: 'absolute',
              top: '20%',
              right: '-10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              zIndex: 30,
              pointerEvents: 'none'
            }}>
              {speechBubbles.map(b => (
                <div
                  key={b.id}
                  className="speech-bubble-right"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '14px',
                    borderBottomLeftRadius: '2px',
                    fontSize: '12px',
                    fontWeight: '600',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.5), 0 0 12px rgba(37,99,235,0.4)',
                    maxWidth: '180px'
                  }}
                >
                  💬 {b.text}
                </div>
              ))}
            </div>

            {}
            <div style={{
              position: 'absolute',
              bottom: '20%',
              left: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              zIndex: 30,
              pointerEvents: 'none'
            }}>
              {floatingStickers.map(s => (
                <div
                  key={s.id}
                  className="sticker-float-left"
                  style={{
                    fontSize: '36px',
                    filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
                  }}
                >
                  {s.emoji}
                </div>
              ))}
            </div>
          </div>
        )}

        {}
        {!detachedMyVideo && (
          <div style={{
            position: 'relative',
            borderRadius: '14px',
            overflow: 'hidden',
            background: isVideoOn ? '#1e293b' : '#020617',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isVideoOn ? (
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                alt="My Cam"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b' }}>
                <User size={32} style={{ marginBottom: '4px' }} />
                <div style={{ fontSize: '11px' }}>Kameran Kapalı</div>
              </div>
            )}

            <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', color: '#fff' }}>
              Sen (Kendi Kameran)
            </div>

            <button
              onClick={() => setDetachedMyVideo(true)}
              style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', padding: '4px', borderRadius: '6px', cursor: 'pointer' }}
              title="Kendi Kameranı Bağımsız Pencere Yap"
            >
              <ExternalLink size={14} />
            </button>
          </div>
        )}
      </div>

      {}
      {(detachedFriendVideo || detachedMyVideo) && (
        <div style={{ padding: '6px 14px', background: 'rgba(37, 99, 235, 0.15)', borderTop: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>📌 Kamera penceresi bağımsız olarak ayrıldı. Oyun köşesine iğneleyebilirsin.</span>
          <button
            onClick={() => { setDetachedFriendVideo(false); setDetachedMyVideo(false); }}
            style={{ background: 'transparent', border: 'underline', color: '#fff', cursor: 'pointer', fontSize: '11px' }}
          >
            Tekrar Birleştir
          </button>
        </div>
      )}

      {}
      <div style={{ padding: '8px 12px', background: 'rgba(0, 0, 0, 0.4)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        
        {}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>Sol Çıkartma FX:</span>
          {['🔥', '😎', '👏', '🚀', '💀', '👑'].map(emoji => (
            <button
              key={emoji}
              onClick={() => handleTriggerSticker(emoji)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'transform 0.1s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.85)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {emoji}
            </button>
          ))}
        </div>

        {}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            value={callInputText}
            onChange={(e) => setCallInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendCallMessage()}
            placeholder="Görüntü yanına konuşma baloncuğu yaz..."
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#fff',
              fontSize: '12px',
              outline: 'none'
            }}
          />
          <button
            onClick={handleSendCallMessage}
            style={{ background: '#2563eb', border: 'none', color: '#fff', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
          >
            Sağ Baloncuk Yap
          </button>
        </div>

        {}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', paddingTop: '4px' }}>
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: isMicOn ? 'rgba(255, 255, 255, 0.1)' : '#ef4444',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
          >
            {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
          </button>

          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: isVideoOn ? 'rgba(255, 255, 255, 0.1)' : '#ef4444',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isVideoOn ? 'Turn Off Cam' : 'Turn On Cam'}
          >
            {isVideoOn ? <Video size={16} /> : <VideoOff size={16} />}
          </button>

          <button
            onClick={onCloseCall}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#ef4444',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)'
            }}
            title="Aramayı Sonlandır"
          >
            <PhoneOff size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
