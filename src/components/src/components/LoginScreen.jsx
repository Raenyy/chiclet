import React, { useState } from 'react';
import { MessageCircle, Settings, ArrowRight } from 'lucide-react';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [shake, setShake] = useState(false);

  const handleLogin = () => {
    if (!username.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    onLogin(username.trim());
  };

  return (
    <div style={{
      width: '340px',
      background: 'rgba(15, 20, 35, 0.85)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '20px',
      boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Üst Bar */}
      <div style={{
        padding: '10px 14px',
        background: 'rgba(0,0,0,0.4)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '22px', height: '22px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <MessageCircle size={13} color="#fff" />
          </div>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '0.5px' }}>
            Chiclet
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['#f59e0b', '#ef4444'].map((c, i) => (
            <div key={i} style={{ width: '11px', height: '11px', borderRadius: '50%', background: c, opacity: 0.8 }} />
          ))}
        </div>
      </div>

      {/* İçerik */}
      <div style={{ padding: '36px 28px 28px' }}>
        {/* Logo & İsim */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
          }}>
            <MessageCircle size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#f1f5f9', margin: 0 }}>
            Chiclet'e Hoş Geldin
          </h1>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
            Kullanıcı adını gir ve başla
          </p>
        </div>

        {/* Kullanıcı Adı Input */}
        <div style={{
          animation: shake ? 'shake 0.4s ease' : 'none',
          marginBottom: '14px'
        }}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Kullanıcı adın..."
            maxLength={24}
            autoFocus
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#f1f5f9',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => e.target.style.borderColor = '#6366f1'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
          />
        </div>

        {/* Giriş Yap Butonu */}
        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
            transition: 'opacity 0.2s, transform 0.1s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Giriş Yap
          <ArrowRight size={16} />
        </button>

        {/* Alt Ayarlar Butonu */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => alert('Tema ayarları yakında!')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#475569',
              cursor: 'pointer',
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#94a3b8'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
          >
            <Settings size={13} />
            Tema Ayarları & Kişiselleştir
          </button>
        </div>
      </div>

      {/* Shake Animasyonu */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}