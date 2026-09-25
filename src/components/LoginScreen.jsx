import React, { useState, useRef, useCallback } from 'react';
import ginghamBg from '../assets/gingham-bg.png';
import chicletLogo from '../assets/ChicletLogoNew.jpg';

let ipcRenderer = null;
try { ipcRenderer = window.require('electron').ipcRenderer; } catch (_) {}

export default function LoginScreen({ onLogin, onOpenThemeStudio, currentTheme, onMinimize }) {
  const [username, setUsername] = useState('');
  const [shake, setShake] = useState(false);
  const [btnPressed, setBtnPressed] = useState(false);

  const [pos, setPos] = useState(() => ({
    x: Math.round(window.innerWidth / 2 - 205),
    y: Math.round(window.innerHeight / 2 - 250)
  }));

  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const minimizeBtnRef = useRef(null);

  const handleLogin = () => {
    if (!username.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setBtnPressed(true);
    setTimeout(() => {
      setBtnPressed(false);
      onLogin(username.trim());
    }, 200);
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
        x: Math.max(0, Math.min(window.innerWidth - 410, ev.clientX - dragOffset.current.x)),
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
    <div data-chiclet="true" style={{ position: 'fixed', left: `${pos.x}px`, top: `${pos.y}px`, width: 410, height: 500, pointerEvents: 'auto', zIndex: 1000 }}>
      <div style={{ width: 410, height: 500, position: 'relative', background: 'linear-gradient(151deg, #FDF0E4 0%, #F587A5 100%)', overflow: 'hidden', borderRadius: 14 }}>

        {/* Gingham bg overlay */}
        <img style={{ width: 420, height: 500, left: 0, top: 0, position: 'absolute', opacity: 0.25, border: '1px black solid', userSelect: 'none', pointerEvents: 'none' }} src={ginghamBg} alt="" draggable={false} />

        {/* Titlebar */}
        <div onMouseDown={onHeaderMouseDown} style={{ width: 391, height: 39, left: 10, top: 12, position: 'absolute', background: '#F3A6BA', boxShadow: '2px 4px 4px 1px rgba(0,0,0,0.40)', overflow: 'hidden', borderRadius: 8, outline: '1px black solid', cursor: 'default' }}>
          {/* Logo */}
          <div style={{ width: 27, height: 27, left: 6, top: 6, position: 'absolute', background: 'white', overflow: 'hidden', borderRadius: 6, outline: '1px black solid', outlineOffset: '-1px' }}>
            <img style={{ width: 31, height: 31, left: -2, top: -2, position: 'absolute' }} src={chicletLogo} alt="Chiclet" draggable={false} />
          </div>
          <div style={{ left: 37, top: 10, position: 'absolute', color: 'black', fontSize: 13, fontFamily: 'Poppins', fontWeight: '600', pointerEvents: 'none', userSelect: 'none' }}>Chiclet</div>

          {/* Sarı minimize — klasik – işareti */}
          <button ref={minimizeBtnRef} onClick={handleMinimize} title="Küçült" style={{ width: 26, height: 26, left: 327, top: 7, position: 'absolute', background: '#F7D797', boxShadow: '1px 1px 4px rgba(0,0,0,0.30), 0px 2px 2px rgba(0,0,0,0.25) inset', borderRadius: 8, border: '1px black solid', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 15, fontWeight: '900', lineHeight: 1, color: '#1E1E1E' }}>
            &#8722;
          </button>

          {/* Kırmızı kapat — klasik × işareti */}
          <button onClick={handleClose} title="Kapat" style={{ width: 26, height: 26, left: 359, top: 7, position: 'absolute', background: '#F19191', boxShadow: '1px 1px 4px rgba(0,0,0,0.30), 0px 1px 3px rgba(0,0,0,0.25) inset', borderRadius: 8, border: '1px black solid', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 13, fontWeight: '700', lineHeight: 1, color: '#1E1E1E' }}>
            &#10005;
          </button>
        </div>

        {/* Ana logo */}
        <div style={{ width: 129, height: 129, left: 145, top: 93, position: 'absolute', background: 'white', boxShadow: '2px 4px 4px 1px rgba(0,0,0,0.25)', overflow: 'hidden', borderRadius: 30, outline: '1px #FF82CD solid' }}>
          <img style={{ width: 149, height: 149, left: -10, top: -10, position: 'absolute', border: '1px black solid' }} src={chicletLogo} alt="Chiclet Logo" draggable={false} />
        </div>

        {/* Başlık metni */}
        <div style={{ width: 358, height: 83, left: 25, top: 231, position: 'absolute', overflow: 'hidden' }}>
          <div style={{ left: 37, top: 11, position: 'absolute', color: 'black', fontSize: 28, fontFamily: 'Poppins', fontWeight: '600', whiteSpace: 'nowrap' }}>Chiclet`e Hoş Geldin</div>
          <div style={{ left: 77, top: 54, position: 'absolute', color: 'rgba(0,0,0,0.75)', fontSize: 15, fontFamily: 'Poppins', fontWeight: '400', letterSpacing: 0.30 }}>Kullanıcı adını gir ve başla</div>
        </div>

        {/* Input */}
        <div style={{ width: 347, height: 40, left: 31, top: 334, position: 'absolute', background: '#FCEDF1', boxShadow: '2px 4px 4px 1px rgba(0,0,0,0.40)', overflow: 'hidden', borderRadius: 10 }}>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} autoFocus placeholder="Kullanıcı Adın..." style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', background: 'transparent', border: shake ? '2px solid #ef4444' : 'none', outline: 'none', padding: '0 10px', color: 'black', fontSize: 14, fontFamily: 'Poppins', fontWeight: '500', letterSpacing: 0.28, boxSizing: 'border-box', animation: shake ? 'shake 0.4s' : 'none' }} />
        </div>

        {/* Giriş Yap butonu */}
        <div onClick={handleLogin} onMouseDown={() => setBtnPressed(true)} onMouseUp={() => setBtnPressed(false)} onMouseLeave={() => setBtnPressed(false)} style={{ width: 347, height: 40, left: 31, top: 393, position: 'absolute', background: '#A2E5FF', boxShadow: btnPressed ? '0px 0px 0px rgba(0,0,0,0.40)' : '2px 4px 4px 1px rgba(0,0,0,0.40)', overflow: 'hidden', borderRadius: 10, cursor: 'pointer', transform: btnPressed ? 'scale(0.97) translateY(2px)' : 'scale(1) translateY(0px)', transition: 'transform 0.1s ease, box-shadow 0.1s ease' }}>
          <div style={{ left: 132, top: 6, position: 'absolute', color: 'black', fontSize: 18, fontFamily: 'Poppins', fontWeight: '600', letterSpacing: 0.36, userSelect: 'none' }}>Giriş Yap</div>
        </div>

        {/* Tema ayarları */}
        <div onClick={onOpenThemeStudio} style={{ left: 119, top: 456, position: 'absolute', color: 'rgba(0,0,0,0.75)', fontSize: 14, fontFamily: 'Poppins', fontWeight: '400', letterSpacing: 0.28, cursor: 'pointer', userSelect: 'none' }}>Tema Ayarları &amp; Kişiselleştir</div>
        <div onClick={onOpenThemeStudio} style={{ width: 31, height: 31, left: 91, top: 452, position: 'absolute', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚙️</div>
      </div>
    </div>
  );
}