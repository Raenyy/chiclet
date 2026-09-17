import React, { useState } from 'react';
import HeaderBar from './HeaderBar.jsx';
import ChatView from './ChatView.jsx';
import HudEmblemWidget from './HudEmblemWidget.jsx';

export default function ChatWindow({ user, onLogout }) {
  const [opacity, setOpacity] = useState(0.82);
  const [isPinned, setIsPinned] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return <HudEmblemWidget onExpand={() => setIsMinimized(false)} />;
  }

  return (
    <div style={{
      width: '420px',
      height: '580px',
      background: `rgba(13, 17, 28, ${opacity})`,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: isPinned ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
      boxShadow: isPinned
        ? '0 0 30px rgba(99,102,241,0.35)'
        : '0 24px 60px rgba(0,0,0,0.7)',
      borderRadius: '18px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 10,
      transition: 'border-color 0.3s, box-shadow 0.3s, background 0.2s',
    }}>
      <HeaderBar
        opacity={opacity}
        setOpacity={setOpacity}
        isPinned={isPinned}
        setIsPinned={setIsPinned}
        onMinimizeToEmblem={() => setIsMinimized(true)}
        user={user}
        onLogout={onLogout}
      />
      <ChatView user={user} />
    </div>
  );
}