import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function HudEmblemWidget({ onExpand, unreadCount = 1 }) {
  return (
    <div
      onClick={onExpand}
      title="Sohbet Katmanını Aç (GameVibe)"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '52px',
        height: '52px',
        borderRadius: '14px',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(59, 130, 246, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 9999,
        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
    >
      <MessageSquare size={24} color="#60a5fa" />
      
      {unreadCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4444, #f97316)',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {unreadCount}
        </span>
      )}
    </div>
  );
}