import React, { useState, useEffect, useRef } from 'react';
import { p2pService } from '../services/P2PService';
import MikrofonIcon from '../assets/MikrofonIcon.png';
import KulaklikIcon from '../assets/KulaklikIcon.png';
import KameraIcon from '../assets/KameraIcon.png';

export default function VoiceCallBar({ user, onEndCall, onSwitchToVideo, onMinimizePanel, onSendVoiceInviteToChat, isVisible = true }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [inviteSent, setInviteSent] = useState(false);
  const [remoteAudioStreams, setRemoteAudioStreams] = useState([]);
  const localStreamRef = useRef(null);

  useEffect(() => {
    let audioStream = null;
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(stream => { audioStream = stream; localStreamRef.current = stream; p2pService.callAllPeers(stream, 'voice'); })
        .catch(() => {});
    }
    const unsubStream = p2pService.onRemoteStream((peerId, stream) => {
      setRemoteAudioStreams(prev => [...prev.filter(s => s.peerId !== peerId), { peerId, stream }]);
    });
    const unsubLeave = p2pService.onPeerLeave((peerId) => {
      setRemoteAudioStreams(prev => prev.filter(s => s.peerId !== peerId));
    });
    return () => { unsubStream(); unsubLeave(); if (audioStream) audioStream.getTracks().forEach(t => t.stop()); };
  }, []);

  useEffect(() => {
    if (localStreamRef.current) localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !isMuted; });
  }, [isMuted]);

  useEffect(() => {
    const timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleInviteToChat = () => {
    onSendVoiceInviteToChat?.();
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 3000);
  };

  if (!isVisible) return null;

  const pillBtn = (active) => ({
    background: active ? '#fecaca' : '#D9D9D9',
    border: '1px solid rgba(0,0,0,0.15)',
    borderRadius: 8,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: '4px 10px',
    fontFamily: 'Poppins',
    fontSize: 11,
    fontWeight: '600',
    color: active ? '#991b1b' : '#000',
    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
    flexShrink: 0
  });

  return (
    <div style={{
      width: '100%',
      background: 'white',
      borderBottom: '1px solid rgba(0,0,0,0.10)',
      padding: '6px 10px 8px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      flexShrink: 0,
      boxSizing: 'border-box'
    }}>
      {/* Üst satır: Sesli Bağlantı + Gizle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontFamily: 'Poppins', fontWeight: '600', color: '#555' }}>
          Sesli Bağlantı ({formatTime(callDuration)})
        </span>
        <button
          onClick={onMinimizePanel}
          title="Gizle"
          style={{ background: '#D9D9D9', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '2px 8px', fontSize: 11, fontFamily: 'Poppins', fontWeight: '600', color: '#000' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
          Gizle ↑
        </button>
      </div>

      {/* Kullanıcı adı */}
      <div style={{ fontSize: 13, fontFamily: 'Poppins', fontWeight: '700', color: '#1a1a1a' }}>
        @{user || 'Kullaniciadin'}
      </div>

      {/* Butonlar satırı */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
        {/* Mikrofon */}
        <button onClick={() => setIsMuted(!isMuted)} title={isMuted ? 'Mikrofonu Aç' : 'Kapat'} style={pillBtn(isMuted)}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
          <img src={MikrofonIcon} alt="" style={{ width: 13, height: 13, objectFit: 'contain' }} />
          <span>{isMuted ? 'Sessiz' : 'Mikrofon'}</span>
        </button>

        {/* Kulaklık */}
        <button onClick={() => setIsDeafened(!isDeafened)} title={isDeafened ? 'Sesi Aç' : 'Kapat'} style={pillBtn(isDeafened)}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
          <img src={KulaklikIcon} alt="" style={{ width: 13, height: 13, objectFit: 'contain' }} />
          <span>{isDeafened ? 'Sağır' : 'Kulaklık'}</span>
        </button>

        {/* Kamera */}
        <button onClick={onSwitchToVideo} title="Görüntülüye Geç" style={pillBtn(false)}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
          <img src={KameraIcon} alt="" style={{ width: 13, height: 13, objectFit: 'contain' }} />
          <span>Kamera</span>
        </button>

        {/* Ayrıl */}
        <button onClick={onEndCall} title="Aramayı Sonlandır" style={{ ...pillBtn(false), background: '#fde8e8', color: '#b91c1c' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
          <span>📵</span>
          <span>Ayrıl</span>
        </button>

        <div style={{ flex: 1 }} />

        {/* Davet Et */}
        <button onClick={handleInviteToChat} title="Davet Gönder" style={{ ...pillBtn(false), background: '#e6d3d9' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
          <span>👋</span>
          <span>{inviteSent ? 'Gönderildi' : 'Davet Et'}</span>
        </button>
      </div>

      {/* Remote audio */}
      {remoteAudioStreams.map(item => (
        <audio key={item.peerId} autoPlay muted={isDeafened} ref={el => { if (el && item.stream && el.srcObject !== item.stream) el.srcObject = item.stream; }} />
      ))}
    </div>
  );
}