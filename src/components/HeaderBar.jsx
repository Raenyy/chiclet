import React from 'react';
import chicletLogo from '../assets/ChicletLogoNew.jpg';
import KameraIcon from '../assets/KameraIcon.png';
import SabitlemeIcon from '../assets/SabitlemeIcon.png';
import AramaIcon from '../assets/AramaIcon.png';

const hoverBtn = {
  transition: 'transform 0.1s ease, box-shadow 0.1s ease',
};

function IconBtn({ onClick, title, bg, active, children, style = {}, ...rest }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 26, height: 26, position: 'absolute',
        background: bg,
        boxShadow: active ? '0 0 0 2px #A2E5FF, 1px 1px 4px rgba(0,0,0,0.25)' : '1px 1px 4px rgba(0,0,0,0.25)',
        borderRadius: 8, border: '1px black solid', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 0, ...hoverBtn, ...style
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = active ? '0 0 0 2px #A2E5FF, 1px 3px 6px rgba(0,0,0,0.20)' : '1px 3px 6px rgba(0,0,0,0.20)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = active ? '0 0 0 2px #A2E5FF, 1px 1px 4px rgba(0,0,0,0.25)' : '1px 1px 4px rgba(0,0,0,0.25)'; }}
      onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
      {...rest}
    >
      {children}
    </button>
  );
}

export default function HeaderBar({
  opacity, setOpacity, isPinned, setIsPinned,
  onMinimizeToEmblem, minimizeBtnRef,
  user, onLogout, onToggleVoiceCall, isVoiceConnected, isVoicePanelVisible,
  onToggleVideoCall, isVideoCallOpen,
  currentTheme, onOpenThemeStudio
}) {
  return (
    <div style={{
      width: 'calc(100% - 20px)',
      height: 39,
      position: 'relative',
      background: '#F3A6BA',
      boxShadow: '2px 4px 4px 1px rgba(0,0,0,0.40)',
      overflow: 'visible',
      borderRadius: 8,
      outline: '1px black solid',
      flexShrink: 0,
      margin: '12px 10px 0 10px',
      boxSizing: 'border-box'
    }}>

      {/* Logo kutusu */}
      <div style={{ width: 27, height: 27, left: 6, top: 6, position: 'absolute', background: 'white', overflow: 'hidden', borderRadius: 6, outline: '1px black solid', outlineOffset: '-1px' }}>
        <img style={{ width: 31, height: 31, left: -2, top: -2, position: 'absolute' }} src={chicletLogo} alt="Logo" draggable={false} />
      </div>

      {/* Opacity slider */}
      <div title={`Şeffaflık: %${Math.round(opacity * 100)}`} style={{ width: 116, height: 11, left: 61, top: 14, position: 'absolute', background: '#D9D9D9', borderRadius: 4, border: '0.20px black solid', cursor: 'pointer' }}>
        <div style={{ width: `${Math.round(opacity * 100)}%`, height: '100%', background: '#7FA5E2', boxShadow: '0px 2px 2px rgba(0,0,0,0.25) inset', border: '0.50px black solid', borderRadius: 4 }} />
        <div style={{ width: 19, height: 19, left: `calc(${Math.round(opacity * 100)}% - 9px)`, top: -4, position: 'absolute', background: '#7FA5E2', boxShadow: '0px 2px 2px rgba(0,0,0,0.25) inset', borderRadius: 9999, border: '0.50px black solid' }} />
        <input type="range" min="0.05" max="0.95" step="0.05" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} />
      </div>

      {/* Ses butonu — left:205 */}
      <IconBtn onClick={onToggleVoiceCall} title={isVoiceConnected ? 'Ses Paneli' : 'Sesli Arama'} bg={isVoiceConnected ? '#A2E5FF' : 'rgba(252,237,241,0.99)'} active={isVoiceConnected} style={{ left: 205, top: 7 }}>
        <img src={AramaIcon} alt="Ses" style={{ width: 16, height: 16, objectFit: 'contain' }} />
      </IconBtn>

      {/* Kamera butonu — left:237 */}
      <IconBtn onClick={onToggleVideoCall} title={isVideoCallOpen ? 'Kamerayı Kapat' : 'Kamera Aç'} bg={isVideoCallOpen ? '#A2E5FF' : '#FCEDF1'} active={isVideoCallOpen} style={{ left: 237, top: 7 }}>
        <img src={KameraIcon} alt="Kamera" style={{ width: 16, height: 16, objectFit: 'contain' }} />
      </IconBtn>

      {/* Sabitle butonu — left:269 */}
      <IconBtn onClick={() => setIsPinned(!isPinned)} title={isPinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'} bg={isPinned ? '#A2E5FF' : '#FCEDF1'} active={isPinned} style={{ left: 269, top: 7 }}>
        <img src={SabitlemeIcon} alt="Sabitle" style={{ width: 16, height: 16, objectFit: 'contain' }} />
      </IconBtn>

      {/* Tema butonu — left:301 */}
      <IconBtn onClick={onOpenThemeStudio} title="Tema & Duvar Kağıdı" bg='#FCEDF1' style={{ left: 301, top: 7, boxShadow: '1px 1px 4px rgba(0,0,0,0.30)', fontSize: 14 }}>
        🎨
      </IconBtn>

      {/* Sarı minimize — left:333 */}
      <button
        ref={minimizeBtnRef}
        onClick={onMinimizeToEmblem}
        title="Simge Moduna Küçült"
        style={{ width: 26, height: 26, left: 333, top: 7, position: 'absolute', background: '#F7D797', boxShadow: '1px 1px 4px rgba(0,0,0,0.30), 0px 2px 2px rgba(0,0,0,0.25) inset', borderRadius: 8, border: '1px black solid', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 15, fontWeight: '900', color: '#1E1E1E', lineHeight: 1, ...hoverBtn }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '1px 3px 6px rgba(0,0,0,0.20)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '1px 1px 4px rgba(0,0,0,0.30), 0px 2px 2px rgba(0,0,0,0.25) inset'; }}
        onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; }}
        onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
      >
        &#8722;
      </button>

      {/* Kırmızı kapat — left:365 */}
      <button
        onClick={onLogout}
        title="Çıkış Yap"
        style={{ width: 26, height: 26, left: 365, top: 7, position: 'absolute', background: '#F19191', boxShadow: '1px 1px 4px rgba(0,0,0,0.30), 0px 1px 3px rgba(0,0,0,0.25) inset', borderRadius: 8, border: '1px black solid', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 13, fontWeight: '700', color: '#1E1E1E', lineHeight: 1, ...hoverBtn }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '1px 3px 6px rgba(0,0,0,0.20)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '1px 1px 4px rgba(0,0,0,0.30), 0px 1px 3px rgba(0,0,0,0.25) inset'; }}
        onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; }}
        onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
      >
        &#10005;
      </button>
    </div>
  );
}