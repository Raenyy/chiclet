import React, { useState, useRef, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';

export default function HudEmblemWidget({ onExpand, unreadCount = 0, spawnPos = null, currentTheme }) {
  const [pos, setPos] = useState(() => {
    if (spawnPos && typeof spawnPos.x === 'number' && typeof spawnPos.y === 'number') {
      return { x: spawnPos.x, y: spawnPos.y };
    }
    return { x: window.innerWidth - 80, y: 80 };
  });

  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  const accentColor = currentTheme?.accentColor || '#6366f1';
  const glowColor = currentTheme?.glowColor || 'rgba(99,102,241,0.35)';

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    hasDragged.current = false;
    window.__startDrag?.();

    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    };

    const onMove = (ev) => {
      if (!dragging.current) return;
      hasDragged.current = true;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 52, ev.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 52, ev.clientY - dragOffset.current.y))
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

  const handleClick = () => {
    if (!hasDragged.current && onExpand) {
      onExpand(pos);
    }
  };

  return (
    <div
      data-chiclet="true"
      onMouseDown={onMouseDown}
      onClick={handleClick}
      title="Sohbeti Aç"
      style={{
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: '52px',
        height: '52px',
        borderRadius: '14px',
        background: 'rgba(13, 17, 28, 0.88)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${accentColor}50`,
        boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 20px ${glowColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        zIndex: 9999,
        userSelect: 'none',
        pointerEvents: 'auto',
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.5), 0 0 28px ${glowColor}`;
        e.currentTarget.style.borderColor = accentColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.5), 0 0 20px ${glowColor}`;
        e.currentTarget.style.borderColor = `${accentColor}50`;
      }}
    >
      <MessageSquare size={22} color={accentColor} />

      {unreadCount > 0 && (
        <span style={{
          position: 'absolute', top: '-5px', right: '-5px',
          width: '18px', height: '18px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #ef4444, #f97316)',
          color: '#fff', fontSize: '10px', fontWeight: 'bold',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 8px rgba(239,68,68,0.6)',
          border: '1px solid rgba(0,0,0,0.3)'
        }}>
          {unreadCount}
        </span>
      )}
    </div>
  );
}
