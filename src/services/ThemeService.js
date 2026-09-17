import p2pService from './P2PService';

// Hazır Temalar (Doğal, Retro, Pastel, Minimal ve Karanlık seçenekler)
export const PRESET_THEMES = [
  {
    id: 'midnight_glass',
    name: 'Midnight Dark',
    description: 'Klasik koyu gece mavisi şeffaf cam',
    bgGradient: 'radial-gradient(ellipse at top, #1a1f35 0%, #0d1117 60%, #000 100%)',
    windowRgb: '13, 17, 28',
    accentColor: '#6366f1',
    accentGradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    userBubbleBg: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    aiBubbleBg: 'rgba(30, 41, 59, 0.95)',
    textColor: '#f1f5f9',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    glowColor: 'rgba(99, 102, 241, 0.35)',
    customWallpaper: null
  },
  {
    id: 'pastel_lavender',
    name: 'Pastel Dream',
    description: 'Yumuşak lavanta ve huzurlu pastel tonlar',
    bgGradient: 'radial-gradient(ellipse at top, #2e1065 0%, #170d2b 60%, #0b0514 100%)',
    windowRgb: '26, 18, 43',
    accentColor: '#c084fc',
    accentGradient: 'linear-gradient(135deg, #c084fc, #f472b6)',
    userBubbleBg: 'linear-gradient(135deg, #a855f7, #ec4899)',
    aiBubbleBg: 'rgba(46, 32, 70, 0.95)',
    textColor: '#fdf4ff',
    borderColor: 'rgba(192, 132, 252, 0.2)',
    glowColor: 'rgba(192, 132, 252, 0.35)',
    customWallpaper: null
  },
  {
    id: 'warm_coffee',
    name: 'Mocha & Warmth',
    description: 'Sıcak kahve, karamel ve toprak tonları',
    bgGradient: 'radial-gradient(ellipse at top, #331e13 0%, #1c110b 60%, #080402 100%)',
    windowRgb: '28, 19, 14',
    accentColor: '#d97706',
    accentGradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
    userBubbleBg: 'linear-gradient(135deg, #b45309, #d97706)',
    aiBubbleBg: 'rgba(48, 33, 24, 0.95)',
    textColor: '#fef3c7',
    borderColor: 'rgba(217, 119, 6, 0.25)',
    glowColor: 'rgba(217, 119, 6, 0.35)',
    customWallpaper: null
  },
  {
    id: 'nordic_slate',
    name: 'Nordic Minimal',
    description: 'İskandinav sade mat antrasit ve gri',
    bgGradient: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 60%, #020617 100%)',
    windowRgb: '15, 23, 42',
    accentColor: '#38bdf8',
    accentGradient: 'linear-gradient(135deg, #38bdf8, #818cf8)',
    userBubbleBg: 'linear-gradient(135deg, #0284c7, #2563eb)',
    aiBubbleBg: 'rgba(30, 41, 59, 0.95)',
    textColor: '#f8fafc',
    borderColor: 'rgba(56, 189, 248, 0.2)',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    customWallpaper: null
  }
];

export const COMMUNITY_THEMES = [];

const LOCAL_STORAGE_KEY = 'chiclet_custom_wallpapers_and_themes';
const ACTIVE_THEME_KEY = 'chiclet_active_theme_id';
const ACTIVE_THEME_DATA_KEY = 'chiclet_active_theme_data';

// Grup Senkronizasyon Kanalı (Aynı bilgisayardaki pencereler için)
let syncChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('chiclet_theme_sync_channel');
  }
} catch (_) {}

export function getSavedCustomThemes() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveCustomTheme(theme) {
  try {
    const themes = getSavedCustomThemes();
    const updated = [theme, ...themes.filter(t => t.id !== theme.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    return false;
  }
}

export function deleteCustomTheme(themeId) {
  try {
    const themes = getSavedCustomThemes();
    const updated = themes.filter(t => t.id !== themeId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    return false;
  }
}

export function getActiveThemeId() {
  return localStorage.getItem(ACTIVE_THEME_KEY) || 'midnight_glass';
}

export function setActiveThemeId(themeId) {
  localStorage.setItem(ACTIVE_THEME_KEY, themeId);
}

export function resolveTheme(themeId) {
  // Önce tam kayıtlı aktif tema verisi var mı bak
  try {
    const rawData = localStorage.getItem(ACTIVE_THEME_DATA_KEY);
    if (rawData) {
      const parsed = JSON.parse(rawData);
      if (parsed && parsed.id === themeId) return parsed;
    }
  } catch (_) {}

  const allThemes = [...PRESET_THEMES, ...getSavedCustomThemes()];
  return allThemes.find(t => t.id === themeId) || PRESET_THEMES[0];
}

// 🌐 GRUP SENKRONİZASYONU: Biri duvar kağıdını/temayı değiştirdiğinde hem yerel hem P2P ile herkese ortak yansıt
export function broadcastThemeChange(theme, username) {
  try {
    localStorage.setItem(ACTIVE_THEME_KEY, theme.id);
    localStorage.setItem(ACTIVE_THEME_DATA_KEY, JSON.stringify(theme));
    if (theme.customWallpaper) {
      saveCustomTheme(theme);
    }
    
    // 1. Aynı makinedeki pencerelere ilet
    if (syncChannel) {
      syncChannel.postMessage({
        type: 'THEME_CHANGED',
        theme,
        user: username || 'Biri',
        timestamp: Date.now()
      });
    }

    // 2. İNTERNET ÜZERİNDEN P2P İLE TÜM BAĞLI BİLGİSAYARLARA İLET
    p2pService.broadcast({
      type: 'THEME_CHANGED',
      theme,
      user: username || 'Biri',
      timestamp: Date.now()
    });
  } catch (e) {}
}

export function subscribeToThemeChanges(callback) {
  const syncHandler = (event) => {
    if (event.data?.type === 'THEME_CHANGED' && event.data.theme) {
      callback(event.data.theme, event.data.user);
    }
  };
  if (syncChannel) {
    syncChannel.addEventListener('message', syncHandler);
  }

  // P2P üzerinden gelen canlı tema değişikliklerini yakala
  const unsubP2P = p2pService.onMessage((data) => {
    if (data?.type === 'THEME_CHANGED' && data.theme) {
      localStorage.setItem(ACTIVE_THEME_KEY, data.theme.id);
      localStorage.setItem(ACTIVE_THEME_DATA_KEY, JSON.stringify(data.theme));
      if (data.theme.customWallpaper) {
        saveCustomTheme(data.theme);
      }
      callback(data.theme, data.user);
    }
  });

  return () => {
    if (syncChannel) {
      syncChannel.removeEventListener('message', syncHandler);
    }
    unsubP2P();
  };
}
