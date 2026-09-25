import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Video } from 'lucide-react';
import HeaderBar from './HeaderBar.jsx';
import ChatView from './ChatView.jsx';
import HudEmblemWidget from './HudEmblemWidget.jsx';
import VoiceCallBar from './VoiceCallBar.jsx';
import VideoCallOverlay from './VideoCallOverlay.jsx';
import { p2pService } from '../services/P2PService';

let ipcRenderer = null;
try { ipcRenderer = window.require('electron').ipcRenderer; } catch (_) {}

const MIN_W = 160;
const MIN_H = 180;
const MAX_W = 680;
const MAX_H = 800;

const MINI_W = 240;
const MINI_H = 220;

function makeDraggable(getPos, setPos, getExtra) {
  return (e) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea')) return;
    e.preventDefault();
    window.__startDrag?.();

    const pos = getPos();
    const offset = { x: e.clientX - pos.x, y: e.clientY - pos.y };

    const onMove = (ev) => {
      const extra = getExtra?.() || {};
      const maxX = window.innerWidth - (extra.totalW || 300);
      const maxY = window.innerHeight - 60;
      setPos({
        x: Math.max(0, Math.min(maxX, ev.clientX - offset.x)),
        y: Math.max(0, Math.min(maxY, ev.clientY - offset.y))
      });
    };

    const onUp = () => {
      window.__endDrag?.();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };
}

export default function ChatWindow({ user, onLogout, currentTheme, onOpenThemeStudio }) {
  const [opacity, setOpacity] = useState(0.88);
  const [isPinned, setIsPinned] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isVoicePanelVisible, setIsVoicePanelVisible] = useState(false);

  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isVideoMinimized, setIsVideoMinimized] = useState(false);
  const [isVideoDetached, setIsVideoDetached] = useState(false);

  const [size, setSize] = useState({ w: 420, h: 500 });
  const [pos, setPos] = useState(() => ({
    x: Math.round(window.innerWidth / 2 - 170),
    y: Math.round(window.innerHeight / 2 - 240)
  }));
  const [emblemSpawnPos, setEmblemSpawnPos] = useState(null);

  const sendVoiceInviteToChatRef = useRef(null);
  const sendVideoInviteToChatRef = useRef(null);
  const minimizeBtnRef = useRef(null);
  const windowRef = useRef(null);


  const isDockedVideo = isVideoCallOpen && !isVideoMinimized && !isVideoDetached;
  const totalW = isDockedVideo ? size.w + 272 : size.w;

  const isMiniMode = size.w < MINI_W || size.h < MINI_H;

  useEffect(() => {
    if (ipcRenderer) ipcRenderer.send('set-always-on-top', isPinned);
  }, [isPinned]);

  useEffect(() => {
    const unsubMsg = p2pService.onMessage((data) => {
      if (data?.type === 'INCOMING_CALL') {
        if (data.mode === 'video') {
          setIsVideoCallOpen(true);
          setIsVideoMinimized(false);
        } else if (data.mode === 'voice') {
          setIsVoiceConnected(true);
          setIsVoicePanelVisible(true);
        }
      }
    });

    const unsubStream = p2pService.onRemoteStream((peerId, stream, username, mode) => {
      if (mode === 'video' || (stream && stream.getVideoTracks().length > 0)) {
        setIsVideoCallOpen(true);
        setIsVideoMinimized(false);
      } else {
        setIsVoiceConnected(true);
        setIsVoicePanelVisible(true);
      }
    });

    return () => {
      unsubMsg();
      unsubStream();
    };
  }, []);

  const handleToggleVoiceCall = () => {
    if (!isVoiceConnected) { setIsVoiceConnected(true); setIsVoicePanelVisible(true); }
    else setIsVoicePanelVisible(!isVoicePanelVisible);
  };
  const handleEndVoiceCall = () => { setIsVoiceConnected(false); setIsVoicePanelVisible(false); };

  const handleToggleVideoCall = () => {
    if (!isVideoCallOpen) {
      setIsVideoCallOpen(true);
      setIsVideoMinimized(false);
    } else if (isVideoMinimized) {
      setIsVideoMinimized(false);
    } else {
      setIsVideoCallOpen(false);
      setIsVideoMinimized(false);
      setIsVideoDetached(false);
    }
  };

  const handleVideoMinimize = () => {
    setIsVideoMinimized(true);
  };

  const handleEndVideoCall = () => {
    setIsVideoCallOpen(false);
    setIsVideoMinimized(false);
    setIsVideoDetached(false);
  };

  const handleMinimize = useCallback(() => {
    if (minimizeBtnRef.current) {
      const rect = minimizeBtnRef.current.getBoundingClientRect();
      setEmblemSpawnPos({ x: rect.left + rect.width / 2 - 28, y: rect.top + rect.height / 2 - 28 });
    }
    setIsMinimized(true);
  }, []);

  const handleExpand = useCallback((emblemPos) => {
    if (emblemPos) {
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - size.w, emblemPos.x - size.w + 60)),
        y: Math.max(0, Math.min(window.innerHeight - size.h, emblemPos.y - 10))
      });
    }
    setIsMinimized(false);
    setUnreadCount(0);
  }, [size]);

  const handleNewMessageArrival = useCallback(() => {
    if (isMinimized) setUnreadCount(prev => prev + 1);
  }, [isMinimized]);

  const onHeaderMouseDown = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    e.preventDefault();
    window.__startDrag?.();
    const offset = { x: e.clientX - pos.x, y: e.clientY - pos.y };

    const onMove = (ev) => {
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - totalW, ev.clientX - offset.x)),
        y: Math.max(0, Math.min(window.innerHeight - 60, ev.clientY - offset.y))
      });
    };
    const onUp = () => {
      window.__endDrag?.();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [pos, totalW]);

  const onResizeSEMouseDown = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    window.__startDrag?.();
    const startX = e.clientX, startY = e.clientY, sw = size.w, sh = size.h;
    const onMove = (ev) => setSize({
      w: Math.min(MAX_W, Math.max(MIN_W, sw + ev.clientX - startX)),
      h: Math.min(MAX_H, Math.max(MIN_H, sh + ev.clientY - startY))
    });
    const onUp = () => { window.__endDrag?.(); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [size]);

  const onResizeSWMouseDown = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    window.__startDrag?.();
    const startX = e.clientX, startY = e.clientY, sw = size.w, sh = size.h, px = pos.x;
    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const newW = Math.min(MAX_W, Math.max(MIN_W, sw - dx));
      setSize({ w: newW, h: Math.min(MAX_H, Math.max(MIN_H, sh + ev.clientY - startY)) });
      setPos(prev => ({ ...prev, x: Math.max(0, px + (sw - newW)) }));
    };
    const onUp = () => { window.__endDrag?.(); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [size, pos]);

  return (
    <>
      {/* Chat minimized — show emblem */}
      {isMinimized && (
        <HudEmblemWidget
          onExpand={handleExpand}
          unreadCount={unreadCount}
          spawnPos={emblemSpawnPos}
          currentTheme={currentTheme}
        />
      )}

      {/* Main window — hidden with display:none, NOT unmounted → messages preserved */}
      <div
        data-chiclet="true"
        ref={windowRef}
        style={{
          display: isMinimized ? 'none' : 'flex',
          position: 'fixed',
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: `${totalW}px`,
          height: `${size.h}px`,
          background: `rgba(254, 205, 214, ${opacity})`,
          border: '2px solid #000000',
          boxShadow: isPinned
            ? '0 14px 40px rgba(0,0,0,0.22), 0 0 0 2px #5bc8f5'
            : '0 12px 36px rgba(0,0,0,0.18)',
          borderRadius: '18px',
          flexDirection: 'row',
          overflow: 'hidden',
          zIndex: 100,
          pointerEvents: 'auto',
          transition: 'width 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          userSelect: 'none',
        }}
      >
        {/* LEFT: Chat area */}
        <div style={{
          width: `${size.w}px`, height: '100%',
          display: 'flex', flexDirection: 'column',
          position: 'relative', flexShrink: 0
        }}>

          {/* Header — mini mode: thin drag strip */}
          {isMiniMode ? (
            <div
              onMouseDown={onHeaderMouseDown}
              style={{
                height: '12px', cursor: 'grab', flexShrink: 0,
                background: 'rgba(255,255,255,0.06)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                position: 'relative', zIndex: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <div style={{ width: '28px', height: '2px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)' }} />
            </div>
          ) : (
            <div onMouseDown={onHeaderMouseDown} style={{ cursor: 'grab', position: 'relative', zIndex: 2, flexShrink: 0 }}>
              <HeaderBar
                opacity={opacity} setOpacity={setOpacity}
                isPinned={isPinned} setIsPinned={setIsPinned}
                minimizeBtnRef={minimizeBtnRef}
                onMinimizeToEmblem={handleMinimize}
                user={user} onLogout={onLogout}
                currentTheme={currentTheme}
                onOpenThemeStudio={onOpenThemeStudio}
                onToggleVoiceCall={handleToggleVoiceCall}
                isVoiceConnected={isVoiceConnected}
                isVoicePanelVisible={isVoicePanelVisible}
                onToggleVideoCall={handleToggleVideoCall}
                isVideoCallOpen={isVideoCallOpen}
              />
            </div>
          )}

          {/* Voice call bar */}
          {isVoiceConnected && (
            <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
              <VoiceCallBar
                user={user} isVisible={isVoicePanelVisible}
                onEndCall={handleEndVoiceCall}
                onMinimizePanel={() => setIsVoicePanelVisible(false)}
                onSendVoiceInviteToChat={() => sendVoiceInviteToChatRef.current?.()}
                onSwitchToVideo={handleToggleVideoCall}
              />
            </div>
          )}

          {/* Chat */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, minHeight: 0 }}>
            <ChatView
              user={user} currentTheme={currentTheme} isMiniMode={isMiniMode}
              opacity={opacity}
              isVoiceConnected={isVoiceConnected}
              onJoinVoiceCall={() => { setIsVoiceConnected(true); setIsVoicePanelVisible(true); }}
              onRegisterSendVoiceInvite={(fn) => { sendVoiceInviteToChatRef.current = fn; }}
              isVideoCallOpen={isVideoCallOpen}
              onJoinVideoCall={handleToggleVideoCall}
              onRegisterSendVideoInvite={(fn) => { sendVideoInviteToChatRef.current = fn; }}
              onNewMessageArrival={handleNewMessageArrival}
            />
          </div>

          {/* Video tab — visible only when video is minimized */}
          {isVideoCallOpen && isVideoMinimized && (
            <div
              onClick={() => setIsVideoMinimized(false)}
              title="Kamerayı Aç"
              style={{
                position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                width: '18px', height: '56px',
                background: 'rgba(34,197,94,0.35)',
                borderLeft: '1px solid rgba(34,197,94,0.5)',
                borderRadius: '6px 0 0 6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 25,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.55)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,197,94,0.35)'}
            >
              <Video size={9} color="#4ade80" />
            </div>
          )}

          {/* SE resize */}
          <div onMouseDown={onResizeSEMouseDown}
            style={{ position: 'absolute', bottom: 0, right: 0, width: '20px', height: '20px', cursor: 'nwse-resize', zIndex: 30 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" style={{ position: 'absolute', bottom: 4, right: 4 }}>
              <line x1="2" y1="9" x2="9" y2="2" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
              <line x1="5" y1="9" x2="9" y2="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
            </svg>
          </div>
          {/* SW resize */}
          <div onMouseDown={onResizeSWMouseDown}
            style={{ position: 'absolute', bottom: 0, left: 0, width: '20px', height: '20px', cursor: 'nesw-resize', zIndex: 30 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" style={{ position: 'absolute', bottom: 4, left: 4 }}>
              <line x1="8" y1="9" x2="1" y2="2" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
              <line x1="5" y1="9" x2="1" y2="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
            </svg>
          </div>
        </div>

        {/* RIGHT: Video panel — docked */}
        {isDockedVideo && (
          <VideoCallOverlay
            user={user} isOpen={true}
            isDetached={false}
            onToggleDetached={setIsVideoDetached}
            onClose={handleEndVideoCall}
            onMinimize={handleVideoMinimize}
            currentTheme={currentTheme}
            onSendVideoInviteToChat={() => sendVideoInviteToChatRef.current?.()}
          />
        )}
      </div>

      {/* DETACHED mode */}
      {isVideoCallOpen && !isVideoMinimized && isVideoDetached && (
        <VideoCallOverlay
          user={user} isOpen={true}
          isDetached={true}
          onToggleDetached={setIsVideoDetached}
          onClose={handleEndVideoCall}
          onMinimize={handleVideoMinimize}
          currentTheme={currentTheme}
          onSendVideoInviteToChat={() => sendVideoInviteToChatRef.current?.()}
        />
      )}
    </>
  );
}