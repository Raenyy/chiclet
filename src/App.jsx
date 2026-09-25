import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import HudEmblemWidget from './components/HudEmblemWidget.jsx';
import ThemeStudioModal from './components/ThemeStudioModal.jsx';
import { resolveTheme, getActiveThemeId, setActiveThemeId, broadcastThemeChange, subscribeToThemeChanges } from './services/ThemeService';

let ipcRenderer = null;
try { ipcRenderer = window.require('electron').ipcRenderer; } catch (_) {}

function initMousePassthrough() {
  if (!ipcRenderer) return;

  let isIgnoring = true;
  ipcRenderer.send('set-ignore-mouse', true);

  const checkMouse = (x, y) => {
    if (window.__isDragging) return;

    const el = document.elementFromPoint(x, y);
    const overChiclet = !!(el && el.closest('[data-chiclet]'));

    if (overChiclet && isIgnoring) {
      isIgnoring = false;
      ipcRenderer.send('set-ignore-mouse', false);
    } else if (!overChiclet && !isIgnoring) {
      isIgnoring = true;
      ipcRenderer.send('set-ignore-mouse', true);
    }
  };

  window.__startDrag = () => {
    window.__isDragging = true;
    if (isIgnoring) {
      isIgnoring = false;
      ipcRenderer.send('set-ignore-mouse', false);
    }
  };

  window.__endDrag = () => {
    window.__isDragging = false;
    setTimeout(() => {
      checkMouse(window.__lastX ?? -1, window.__lastY ?? -1);
    }, 30);
  };

  window.addEventListener('mousemove', (e) => {
    window.__lastX = e.clientX;
    window.__lastY = e.clientY;
    checkMouse(e.clientX, e.clientY);
  }, { passive: true });
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTheme, setCurrentTheme] = useState(() => resolveTheme(getActiveThemeId()));
  const [isThemeStudioOpen, setIsThemeStudioOpen] = useState(false);
  const [themeStudioInitialView, setThemeStudioInitialView] = useState('quick');
  const [isLoginMinimized, setIsLoginMinimized] = useState(false);
  const [loginEmblemPos, setLoginEmblemPos] = useState(null);

  useEffect(() => {
    initMousePassthrough();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToThemeChanges((newTheme) => {
      if (newTheme) {
        setCurrentTheme(newTheme);
      }
    });
    return unsubscribe;
  }, []);

  const handleSelectTheme = (theme) => {
    setCurrentTheme(theme);
    setActiveThemeId(theme.id);
    broadcastThemeChange(theme, currentUser || 'Sen');
  };

  const handleOpenThemeStudio = (view = 'quick') => {
    setThemeStudioInitialView(view);
    setIsThemeStudioOpen(true);
  };

  const handleMinimizeLogin = (pos) => {
    setLoginEmblemPos(pos);
    setIsLoginMinimized(true);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'transparent',
      pointerEvents: 'none',
      zIndex: 0
    }}>
      {currentUser ? (
        <ChatWindow
          user={currentUser}
          currentTheme={currentTheme}
          onLogout={() => setCurrentUser(null)}
          onOpenThemeStudio={() => handleOpenThemeStudio('quick')}
        />
      ) : (
        isLoginMinimized ? (
          <HudEmblemWidget
            onExpand={() => setIsLoginMinimized(false)}
            spawnPos={loginEmblemPos}
            currentTheme={currentTheme}
          />
        ) : (
          <LoginScreen
            currentTheme={currentTheme}
            onLogin={(username) => setCurrentUser(username)}
            onOpenThemeStudio={() => handleOpenThemeStudio('draw')}
            onMinimize={handleMinimizeLogin}
          />
        )
      )}

      {isThemeStudioOpen && (
        <ThemeStudioModal
          currentTheme={currentTheme}
          initialView={themeStudioInitialView}
          onSelectTheme={handleSelectTheme}
          onClose={() => setIsThemeStudioOpen(false)}
        />
      )}
    </div>
  );
}
