import React from 'react';
import { Pin, Eye, Palette, Minus, LogOut, MessageCircle, Phone, Video } from 'lucide-react';

export default function HeaderBar({
  opacity, setOpacity, isPinned, setIsPinned,
  onMinimizeToEmblem, minimizeBtnRef,
  user, onLogout, onToggleVoiceCall, isVoiceConnected, isVoicePanelVisible,
  onToggleVideoCall, isVideoCallOpen,
  currentTheme, onOpenThemeStudio
}) {
  const accentColor = currentTheme?.accentColor || '#6366f1';
  const accentGradient = currentTheme?.accentGradient || 'linear-gradient(135deg, #6366f1, #8b5cf6)';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '7px 10px',
      background: 'rgba(0,0,0,0.45)', borderBottom: '1px solid rgba(255,255,255,0.07)',
      cursor: 'grab', flexShrink: 0, gap: '5px', minHeight: '40px', overflow: 'hidden',
      WebkitAppRegion: 'no-drag'
    }}>
      {/* Logo */}
      <div style={{
        width: '22px', height: '22px', borderRadius: '7px', flexShrink: 0,
        background: accentGradient, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <MessageCircle size={12} color="#fff" />
      </div>

      {/* Kullanıcı adı */}
      {user && (
        <span style={{
          fontSize: '11px', color: accentColor, fontWeight: '600',
          background: `${accentColor}18`, padding: '1px 6px',
          borderRadius: '4px', border: `1px solid ${accentColor}35`,
          whiteSpace: 'nowrap', maxWidth: '80px',
          overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 1
        }}>
          @{user}
        </span>
      )}

      {/* Şeffaflık kaydırıcı */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '3px',
        background: 'rgba(255,255,255,0.05)', padding: '3px 6px',
        borderRadius: '6px', flexShrink: 0
      }}>
        <Eye size={11} color="#64748b" />
        <input
          type="range" min="0.05" max="0.95" step="0.05"
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          style={{ width: '44px', cursor: 'pointer', accentColor }}
          title={`Şeffaflık: %${Math.round(opacity * 100)}`}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Sağ butonlar */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>

        {/* Sesli Arama */}
        <button onClick={onToggleVoiceCall}
          title={isVoiceConnected ? 'Ses panelini aç/kapat' : 'Sesli Arama Başlat'}
          style={{
            ...btnBase,
            background: isVoiceConnected ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${isVoiceConnected ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
            color: isVoiceConnected ? '#4ade80' : '#64748b',
            position: 'relative'
          }}>
          <Phone size={12} />
          {isVoiceConnected && (
            <span style={{
              position: 'absolute', top: '-2px', right: '-2px',
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#22c55e', boxShadow: '0 0 6px #22c55e'
            }} />
          )}
        </button>

        {/* Kamera */}
        <button onClick={onToggleVideoCall}
          title={isVideoCallOpen ? 'Kamerayı Kapat' : 'Görüntülü Arama Başlat'}
          style={{
            ...btnBase,
            background: isVideoCallOpen ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${isVideoCallOpen ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
            color: isVideoCallOpen ? '#4ade80' : '#64748b',
          }}>
          <Video size={12} />
        </button>

        {/* Sabitle */}
        <button onClick={() => setIsPinned(!isPinned)}
          title={isPinned ? 'Sabitlemeyi Kaldır' : 'Ekrana Sabitle'}
          style={{
            ...btnBase,
            background: isPinned ? `${accentColor}25` : 'rgba(255,255,255,0.06)',
            border: `1px solid ${isPinned ? accentColor : 'rgba(255,255,255,0.1)'}`,
            color: isPinned ? accentColor : '#64748b',
          }}>
          <Pin size={12} />
        </button>

        {/* Tema */}
        <button onClick={onOpenThemeStudio} title="Tema & Kişiselleştirme"
          style={{
            ...btnBase,
            background: `${accentColor}15`,
            border: `1px solid ${accentColor}40`,
            color: accentColor,
          }}>
          <Palette size={12} />
        </button>

        {/* Küçült */}
        <button ref={minimizeBtnRef} onClick={onMinimizeToEmblem}
          title="Simge Moduna Küçült" style={{ ...btnBase, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b' }}>
          <Minus size={12} />
        </button>

        {/* Çıkış */}
        <button onClick={onLogout} title="Çıkış Yap"
          style={{ ...btnBase, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
          <LogOut size={12} />
        </button>
      </div>
    </div>
  );
}

const btnBase = {
  border: 'none', borderRadius: '7px', padding: '5px',
  cursor: 'pointer', display: 'flex', alignItems: 'center',
  justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s'
};