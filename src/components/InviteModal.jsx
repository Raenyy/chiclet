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
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '360px',
          maxWidth: '92vw',
          background: 'rgba(15, 20, 32, 0.98)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '18px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.85), 0 0 25px rgba(99,102,241,0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#f1f5f9'
        }}
      >
        {}
        <div style={{
          padding: '10px 14px',
          background: 'rgba(0,0,0,0.4)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '6px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <UserPlus size={12} color="#fff" />
            </div>
            <span style={{ fontSize: '12px', fontWeight: '800' }}>
              Arkadaş Bağlantısı (P2P Oda)
            </span>
          </div>

          <button
            onClick={onClose}
            title="Kapat"
            style={{
              background: 'rgba(255,255,255,0.06)', border: 'none',
              color: '#94a3b8', borderRadius: '6px', padding: '4px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={14} />
          </button>
        </div>

        {}
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: '700' }}>
                🔑 SENİN ODA KODUN (Arkadaşına Gönder):
              </span>
              <span style={{ fontSize: '9px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Wifi size={10} /> Çevrimiçi
              </span>
            </div>

            <div style={{
              display: 'flex',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px',
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
                  color: '#818cf8',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  outline: 'none',
                  fontFamily: 'monospace'
                }}
              />
              <button
                onClick={handleCopy}
                style={{
                  padding: '0 12px',
                  background: copied ? '#22c55e' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'background 0.2s'
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
            </div>
          </div>

          {}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: '700' }}>
              🔗 ARKADAŞININ KODUYLA ODAYA KATIL:
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
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleConnect}
                disabled={joinStatus === 'connecting'}
                style={{
                  padding: '0 12px',
                  background: joinStatus === 'connected' ? '#22c55e' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <LogIn size={12} />
                <span>
                  {joinStatus === 'connecting' ? 'Bağlanıyor...' : joinStatus === 'connected' ? '✓ Bağlandı' : 'Bağlan'}
                </span>
              </button>
            </div>
          </div>

          {}
          {connectedPeers.length > 0 && (
            <div style={{
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '10px',
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={11} /> Odadaki Kişiler ({connectedPeers.length + 1}):
              </div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ color: '#818cf8', fontWeight: '700' }}>@{user || 'Sen'} (Sen)</span>
                {connectedPeers.map(p => (
                  <span key={p.peerId} style={{ color: '#4ade80', fontWeight: '600' }}>
                    · @{p.username}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
