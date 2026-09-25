import React, { useState, useEffect } from 'react';
import { Copy, Check, UserPlus, X, LogIn, Users, Wifi } from 'lucide-react';
import { p2pService } from '../services/P2PService';

export default function InviteModal({ user, onClose }) {
  const [copied, setCopied] = useState(false);
  const [myRoomCode, setMyRoomCode] = useState(p2pService.peerId || 'Bağlanıyor...');
  const [targetRoomCode, setTargetRoomCode] = useState('');
  const [joinStatus, setJoinStatus] = useState(null); // null | 'connecting' | 'connected' | 'error'
  const [connectedPeers, setConnectedPeers] = useState(p2pService.getConnectedPeers());

  useEffect(() => {
    if (p2pService.peerId) {
      setMyRoomCode(p2pService.peerId);
    } else {
      p2pService.onReady((id) => {
        setMyRoomCode(id);
      });
    }

    const unsubJoin = p2pService.onPeerJoin(() => {
      setConnectedPeers(p2pService.getConnectedPeers());
    });

    const unsubLeave = p2pService.onPeerLeave(() => {
      setConnectedPeers(p2pService.getConnectedPeers());
    });

    return () => {
      unsubJoin();
      unsubLeave();
    };
  }, []);

  const handleCopy = () => {
    if (!p2pService.peerId) return;
    navigator.clipboard.writeText(p2pService.peerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConnect = async () => {
    if (!targetRoomCode.trim()) return;
    const cleanCode = targetRoomCode.trim();
    setJoinStatus('connecting');

    try {
      const res = await p2pService.connectToPeerAsync(cleanCode);
      if (res && res.success) {
        setJoinStatus('connected');
        setConnectedPeers(p2pService.getConnectedPeers());
        setTimeout(() => onClose(), 1200);
      } else {
        setJoinStatus('error');
        setTimeout(() => setJoinStatus(null), 3500);
      }
    } catch (_) {
      setJoinStatus('error');
      setTimeout(() => setJoinStatus(null), 3500);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '380px',
          maxWidth: '92vw',
          background: '#fecdd6',
          border: '2px solid #000000',
          borderRadius: '18px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.22)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#000000'
        }}
      >
        {/* Başlık Barı */}
        <div
          className="chiclet-titlebar"
          style={{
            margin: '8px 8px 0 8px',
            height: '40px',
            padding: '0 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <UserPlus size={14} color="#000" />
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#000' }}>
              Arkadaş Bağlantısı (P2P Oda)
            </span>
          </div>

          <button
            onClick={onClose}
            className="chiclet-btn-close"
            title="Kapat"
          >
            ✕
          </button>
        </div>

        {/* İçerik */}
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Kod Paylaşım Kartı */}
          <div style={{
            background: '#fff0f3',
            border: '1.5px solid rgba(0,0,0,0.1)',
            borderRadius: '14px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#000', fontWeight: '800' }}>
                SENİN ODA KODUN:
              </span>
              <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Wifi size={11} /> Çevrimiçi
              </span>
            </div>

            <div style={{
              display: 'flex',
              background: '#ffffff',
              border: '2px solid #000000',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <input
                type="text"
                readOnly
                value={myRoomCode}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  background: 'transparent',
                  border: 'none',
                  color: '#000000',
                  fontSize: '12px',
                  fontWeight: '700',
                  outline: 'none',
                  fontFamily: 'monospace'
                }}
              />
              <button
                onClick={handleCopy}
                style={{
                  padding: '0 14px',
                  background: copied ? '#bbf7d0' : '#9de3fe',
                  border: 'none',
                  borderLeft: '2px solid #000000',
                  color: '#000000',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
            </div>
          </div>

          {/* Odaya Katıl Kartı */}
          <div style={{
            background: '#fff0f3',
            border: '1.5px solid rgba(0,0,0,0.1)',
            borderRadius: '14px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <span style={{ fontSize: '11px', color: '#000', fontWeight: '800' }}>
              ARKADAŞININ KODUYLA ODAYA KATIL:
            </span>

            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={targetRoomCode}
                onChange={(e) => setTargetRoomCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                placeholder="Örn: chic_mert_8491"
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  background: '#ffffff',
                  border: '2px solid #000000',
                  borderRadius: '10px',
                  color: '#000000',
                  fontSize: '12px',
                  fontWeight: '600',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleConnect}
                disabled={joinStatus === 'connecting'}
                className="chiclet-btn-primary"
                style={{
                  padding: '0 14px',
                  height: '36px',
                  fontSize: '12px',
                  fontWeight: '800'
                }}
              >
                <LogIn size={13} />
                <span>
                  {joinStatus === 'connecting' ? 'Bağlanıyor...' : joinStatus === 'connected' ? '✓ Bağlandı' : 'Bağlan'}
                </span>
              </button>
            </div>
          </div>

          {/* Odadaki Kişiler */}
          {connectedPeers.length > 0 && (
            <div style={{
              background: '#bbf7d0',
              border: '1.5px solid #000',
              borderRadius: '12px',
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#000', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={12} /> Odadaki Kişiler ({connectedPeers.length + 1}):
              </div>
              <div style={{ fontSize: '11px', color: '#000', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontWeight: '800' }}>@{user || 'Sen'} (Sen)</span>
                {connectedPeers.map(p => (
                  <span key={p.peerId} style={{ fontWeight: '700' }}>
                    · @{p.username}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}