import React, { useState, useRef, useCallback } from 'react';
import chicletLogo from '../assets/ChicletLogoNew.png';

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
        x: Math.max(0, Math.min(window.innerWidth - 56, ev.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 56, ev.clientY - dragOffset.current.y))
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
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'transparent',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        zIndex: 9999,
        userSelect: 'none',
        pointerEvents: 'auto',
        transition: 'transform 0.15s ease',
        filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.25))'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <img
        src={chicletLogo}
        alt="Chiclet Logo"
        style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
      />

      {unreadCount > 0 && (
        <span style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#fce38a',
          color: '#000000',
          fontSize: '11px',
          fontWeight: '800',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1.5px solid #000000',
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
        }}>
          {unreadCount}
        </span>
      )}
    </div>
  );
}