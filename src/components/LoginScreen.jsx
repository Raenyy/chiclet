import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MessageCircle, Settings, ArrowRight, Minus, X } from 'lucide-react';

let ipcRenderer = null;
try { ipcRenderer = window.require('electron').ipcRenderer; } catch (_) {}

export default function LoginScreen({ onLogin, onOpenThemeStudio, currentTheme, onMinimize }) {
  const [username, setUsername] = useState('');
  const [shake, setShake] = useState(false);

  const [pos, setPos] = useState(() => ({
    x: Math.round(window.innerWidth / 2 - 170),
    y: Math.round(window.innerHeight / 2 - 250)
  }));

  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const minimizeBtnRef = useRef(null);
  const cardRef = useRef(null);

  const accentColor = currentTheme?.accentColor || '#ef4444';
  const glowColor = currentTheme?.glowColor || 'rgba(239, 68, 68, 0.4)';

  const handleLogin = () => {
    if (!username.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    onLogin(username.trim());
  };

  const handleClose = () => {
    if (ipcRenderer) ipcRenderer.send('close-app');
    else window.close();
  };

  const handleMinimize = () => {
    if (onMinimize) {
      const rect = minimizeBtnRef.current?.getBoundingClientRect();
      onMinimize(rect ? { x: rect.left, y: rect.top } : { x: pos.x, y: pos.y });
    }
  };

  const onHeaderMouseDown = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    e.preventDefault();
    dragging.current = true;
    window.__startDrag?.();
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };

    const onMove = (ev) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 340, ev.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 60, ev.clientY - dragOffset.current.y))
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
  }, [pos]);

  return (
    <div
      data-chiclet="true"
      style={{
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: '340px',
        pointerEvents: 'auto', 
        zIndex: 1000
      }}
    >
      <div
        ref={cardRef}
        style={{
          width: '340px',
          background: 'rgba(10, 13, 22, 0.99)',
          border: `1px solid rgba(255, 255, 255, 0.10)`,
          borderRadius: '20px',
          boxShadow: `0 25px 60px rgba(0,0,0,0.92), 0 0 30px ${glowColor}`,
          overflow: 'hidden'
        }}
      >
        {}
        <div
          onMouseDown={onHeaderMouseDown}
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0,0,0,0.3)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            cursor: 'grab',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '9px',
              background: accentColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 12px ${glowColor}`
            }}>
              <MessageCircle size={16} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>
              Chiclet
            </span>
          </div>

          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              ref={minimizeBtnRef}
              onClick={handleMinimize}
              style={headerBtnStyle}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
            >
              <Minus size={13} />
            </button>
            <button
              onClick={handleClose}
              style={headerBtnStyle}
              onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {}
        <div style={{ padding: '28px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '68px', height: '68px', borderRadius: '22px',
            background: accentColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 30px ${glowColor}`
          }}>
            <MessageCircle size={36} color="#fff" fill="#fff" />
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 }}>
              Chiclet'e Hoş Geldin
            </h1>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
              Kullanıcı adını gir ve başla
            </p>
          </div>

          <form
            onSubmit={e => { e.preventDefault(); handleLogin(); }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Kullanıcı adın..."
              autoFocus
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '12px 14px',
                background: '#131926',
                border: shake ? '1.5px solid #ef4444' : `1.5px solid ${accentColor}55`,
                borderRadius: '12px', color: '#fff', fontSize: '13px',
                outline: 'none', transition: 'border 0.2s',
                animation: shake ? 'shake 0.4s' : 'none'
              }}
              onFocus={e => e.target.style.borderColor = accentColor}
              onBlur={e => e.target.style.borderColor = `${accentColor}55`}
            />

            <button
              type="submit"
              style={{
                width: '100%', padding: '12px',
                borderRadius: '12px', border: 'none',
                background: accentColor, color: '#fff',
                fontWeight: '800', fontSize: '14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                boxShadow: `0 6px 20px ${glowColor}`,
                transition: 'opacity 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Giriş Yap <ArrowRight size={15} />
            </button>
          </form>

          <button
            onClick={onOpenThemeStudio}
            style={{
              background: 'transparent', border: 'none',
              color: '#475569', fontSize: '11.5px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px',
              transition: 'color 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
            onMouseLeave={e => e.currentTarget.style.color = '#475569'}
          >
            <Settings size={12} /> Tema Ayarları & Kişiselleştir
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}

const headerBtnStyle = {
  background: 'rgba(255,255,255,0.07)', border: 'none',
  color: '#94a3b8', borderRadius: '7px', width: '26px', height: '26px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'background 0.15s, color 0.15s'
};
