import React, { useState, useRef, useEffect } from 'react';
import { Palette, Sparkles, Trash2, X, Brush, Eraser, RotateCcw, Smile, Plus, Edit3, Download, Upload, Image as ImageIcon, Check } from 'lucide-react';
import {
  PRESET_THEMES,
  getSavedCustomThemes,
  saveCustomTheme,
  deleteCustomTheme
} from '../services/ThemeService';


const STICKER_LIBRARY = [
  '🌸', '✨', '⚡', '👑', '🎮', '🐱', '🚀', '🍄',
  '👾', '☕', '💎', '🍕', '🫧', '🌈', '🧸', '🌙',
  '🎨', '🍉', '🕹️', '🐸', '🦆', '🔥', '💀', '💜'
];

const PALETTE_COLORS = [
  '#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6',
  '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6',
  '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b',
  '#f97316', '#ef4444', '#78716c', '#cbd5e1', '#ffffff'
];

const CANVAS_BACKGROUNDS = [
  { label: 'Koyu Gece', color: '#0d1117', rgb: '13, 17, 28' },
  { label: 'Sıcak Kahve', color: '#1a120b', rgb: '26, 18, 11' },
  { label: 'Pastel Mor', color: '#1b132a', rgb: '27, 19, 42' },
  { label: 'Mat Antrasit', color: '#131720', rgb: '19, 23, 32' },
  { label: 'Derin Orman', color: '#0a1a14', rgb: '10, 26, 20' }
];

export default function ThemeStudioModal({ currentTheme, onSelectTheme, onClose, initialView = 'quick' }) {
  const [viewMode, setViewMode] = useState(initialView); // 'quick' | 'draw'
  const [savedThemes, setSavedThemes] = useState(getSavedCustomThemes());
  const [backupSuccessMsg, setBackupSuccessMsg] = useState(null);

  // Çizim & Renk Araçları
  const [activeTool, setActiveTool] = useState('brush'); // 'brush' | 'eraser' | 'sticker'
  const [brushColor, setBrushColor] = useState('#a855f7');
  const [brushSize, setBrushSize] = useState(6);
  const [selectedSticker, setSelectedSticker] = useState('✨');
  const [canvasBg, setCanvasBg] = useState(CANVAS_BACKGROUNDS[0]);
  const [themeName, setThemeName] = useState('Yeni Çizimim');
  const [editingThemeId, setEditingThemeId] = useState(null);

  // Özelleştirilebilir Mesaj Balonu Renkleri
  const [userBubbleColor, setUserBubbleColor] = useState('#4f46e5');
  const [userBubbleEndColor, setUserBubbleEndColor] = useState('#7c3aed');
  const [aiBubbleColor, setAiBubbleColor] = useState('rgba(30, 41, 59, 0.95)');

  const [showLivePreview, setShowLivePreview] = useState(true);
  const [stickersOnCanvas, setStickersOnCanvas] = useState([]);

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const drawHistory = useRef([]);
  const fileInputRef = useRef(null);
  const canvasImageInputRef = useRef(null);

  useEffect(() => {
    if (viewMode === 'draw' && canvasRef.current && !editingThemeId) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = canvasBg.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveState();
    }
  }, [viewMode, editingThemeId]);

  const saveState = (updatedStickers = stickersOnCanvas) => {
    if (!canvasRef.current) return;
    drawHistory.current.push({
      canvasData: canvasRef.current.toDataURL(),
      stickers: [...updatedStickers]
    });
    if (drawHistory.current.length > 25) drawHistory.current.shift();
  };

  const handleUndo = () => {
    if (drawHistory.current.length <= 1) return;
    drawHistory.current.pop();
    const prev = drawHistory.current[drawHistory.current.length - 1];
    if (!prev) return;

    setStickersOnCanvas(prev.stickers || []);

    if (prev.canvasData) {
      const img = new window.Image();
      img.src = prev.canvasData;
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        }
      };
    }
  };

  const handleClear = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = canvasBg.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setStickersOnCanvas([]);
    saveState([]);
  };

  const changeCanvasBg = (bg) => {
    setCanvasBg(bg);
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState(stickersOnCanvas);
  };

  // Düzenleme modunu aç
  const handleStartEditTheme = (theme, e) => {
    e.stopPropagation();
    setEditingThemeId(theme.id);
    setThemeName(theme.name);
    if (theme.accentColor) setBrushColor(theme.accentColor);
    if (theme.userBubbleBg) {
      setUserBubbleColor(theme.accentColor || '#4f46e5');
    }
    setViewMode('draw');

    setTimeout(() => {
      if (canvasRef.current && theme.customWallpaper) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new window.Image();
        img.src = theme.customWallpaper;
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          saveState([]);
        };
      }
    }, 50);
  };

  const startDrawing = (e) => {
    if (activeTool === 'sticker') {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newSticker = {
        id: Date.now(),
        emoji: selectedSticker,
        x: x - 16,
        y: y - 16,
        size: 32
      };
      const updated = [...stickersOnCanvas, newSticker];
      setStickersOnCanvas(updated);
      saveState(updated);
      return;
    }

    isDrawing.current = true;
    const rect = canvasRef.current.getBoundingClientRect();
    lastPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const draw = (e) => {
    if (!isDrawing.current || activeTool === 'sticker') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(currentX, currentY);

    if (activeTool === 'eraser') {
      ctx.strokeStyle = canvasBg.color;
      ctx.lineWidth = brushSize * 2.5;
    } else {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPos.current = { x: currentX, y: currentY };
  };

  const stopDrawing = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      saveState();
    }
  };

  const generateWallpaperDataUrl = () => {
    if (!canvasRef.current) return null;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasRef.current.width;
    tempCanvas.height = canvasRef.current.height;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.drawImage(canvasRef.current, 0, 0);
    tempCtx.font = '28px sans-serif';
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    stickersOnCanvas.forEach(s => {
      tempCtx.fillText(s.emoji, s.x + 16, s.y + 16);
    });

    return tempCanvas.toDataURL('image/png');
  };

  const handleSaveAndApplyWallpaper = () => {
    const wallpaperUrl = generateWallpaperDataUrl();
    const finalUserBubble = `linear-gradient(135deg, ${userBubbleColor}, ${userBubbleEndColor})`;

    const newTheme = {
      id: editingThemeId || `custom_art_${Date.now()}`,
      name: themeName.trim() || 'Özel Sanat Temam',
      isCustom: true,
      bgGradient: `radial-gradient(ellipse at top, ${canvasBg.color} 0%, #000 100%)`,
      windowRgb: canvasBg.rgb,
      accentColor: userBubbleColor,
      accentGradient: `linear-gradient(135deg, ${userBubbleColor}, ${userBubbleEndColor})`,
      userBubbleBg: finalUserBubble,
      aiBubbleBg: aiBubbleColor,
      textColor: '#f1f5f9',
      borderColor: `${userBubbleColor}50`,
      glowColor: `${userBubbleColor}40`,
      customWallpaper: wallpaperUrl
    };

    saveCustomTheme(newTheme);
    setSavedThemes(getSavedCustomThemes());
    onSelectTheme(newTheme);
    setEditingThemeId(null);
    setViewMode('quick');
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteCustomTheme(id);
    setSavedThemes(getSavedCustomThemes());
  };

  // 💾 DOSYAYA YEDEKLE (TÜM TEMALAR)
  const handleExportAllThemes = () => {
    const themesToExport = getSavedCustomThemes();
    if (themesToExport.length === 0) {
      alert('Henüz kaydedilmiş özel bir temanız yok!');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(themesToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `chiclet-temalarim-yedek-${new Date().toISOString().slice(0,10)}.chiclet`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setBackupSuccessMsg('Temaların dosyaya kaydedildi!');
    setTimeout(() => setBackupSuccessMsg(null), 3000);
  };

  // 💾 TEK BİR TEMAYI RESİM OLARAK İNDİR
  const handleDownloadSingleTheme = (theme, e) => {
    e.stopPropagation();
    if (theme.customWallpaper) {
      const link = document.createElement('a');
      link.download = `${theme.name.replace(/\s+/g, '_')}_duvarkagidi.png`;
      link.href = theme.customWallpaper;
      link.click();
    }
  };

  // 📥 DOSYADAN TEMA İÇE AKTAR (YEDEKTEN GERİ YÜKLE)
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.name.endsWith('.chiclet') || file.name.endsWith('.json')) {
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          const list = Array.isArray(imported) ? imported : [imported];
          list.forEach(t => {
            if (t.name && t.customWallpaper) {
              saveCustomTheme(t);
            }
          });
          const updated = getSavedCustomThemes();
          setSavedThemes(updated);
          if (list[0]) onSelectTheme(list[0]);
          setBackupSuccessMsg(`${list.length} adet tema başarıyla yüklendi!`);
          setTimeout(() => setBackupSuccessMsg(null), 3500);
        } catch (err) {
          alert('Dosya okunurken bir hata oluştu! Geçerli bir .chiclet dosyası seçtiğinizden emin olun.');
        }
      };
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        const newTheme = {
          id: `imported_img_${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, "") || 'Yüklenen Duvar Kağıdı',
          isCustom: true,
          bgGradient: `radial-gradient(ellipse at top, #0d1117 0%, #000 100%)`,
          windowRgb: '13, 17, 28',
          accentColor: '#6366f1',
          accentGradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          userBubbleBg: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          aiBubbleBg: 'rgba(30, 41, 59, 0.95)',
          textColor: '#f1f5f9',
          borderColor: '#6366f150',
          glowColor: '#6366f140',
          customWallpaper: dataUrl
        };
        saveCustomTheme(newTheme);
        setSavedThemes(getSavedCustomThemes());
        onSelectTheme(newTheme);
        setBackupSuccessMsg('Fotoğrafınız duvar kağıdı olarak eklendi!');
        setTimeout(() => setBackupSuccessMsg(null), 3500);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // 🖼️ TUVALE RESİM YÜKLE (ÇİZİM ESNASINDA)
  const handleLoadImageToCanvas = (e) => {
    const file = e.target.files?.[0];
    if (!file || !canvasRef.current) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveState();
      };
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ─── Sürüklenebilir Panel ────────────────────────────────────────────────────
  const [modalPos, setModalPos] = useState(() => ({
    x: Math.round(window.innerWidth / 2 - (viewMode === 'draw' ? 370 : 270)),
    y: Math.round(window.innerHeight / 2 - 300)
  }));
  const modalDragging = useRef(false);
  const modalDragOffset = useRef({ x: 0, y: 0 });

  const onModalHeaderMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    e.preventDefault();
    modalDragging.current = true;
    modalDragOffset.current = { x: e.clientX - modalPos.x, y: e.clientY - modalPos.y };
    const onMove = (ev) => {
      if (!modalDragging.current) return;
      setModalPos({
        x: Math.max(0, Math.min(window.innerWidth - 100, ev.clientX - modalDragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 60, ev.clientY - modalDragOffset.current.y))
      });
    };
    const onUp = () => {
      modalDragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    // Floating panel — tam ekran backdrop YOK, arkadaki her şey tıklanabilir
    <div
      data-chiclet="true"
      style={{
        position: 'fixed',
        left: `${modalPos.x}px`,
        top: `${modalPos.y}px`,
        zIndex: 10000,
        pointerEvents: 'auto',
      }}
    >
      {/* Gizli Dosya Seçiciler */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".chiclet,.json,image/*"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={canvasImageInputRef}
        onChange={handleLoadImageToCanvas}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <div style={{
        width: viewMode === 'draw' ? '740px' : '540px',
        maxHeight: '92vh',
        background: 'rgba(15, 20, 32, 0.98)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '22px',
        boxShadow: '0 25px 70px rgba(0,0,0,0.85), 0 0 35px rgba(99,102,241,0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#f1f5f9',
        transition: 'width 0.25s ease'
      }}>
        {/* Üst Bar */}
        <div
          onMouseDown={onModalHeaderMouseDown}
          style={{
            padding: '12px 18px',
            background: 'rgba(0,0,0,0.45)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'grab',
            userSelect: 'none'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '7px',
              background: 'linear-gradient(135deg, #a855f7, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Palette size={13} color="#fff" />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '800' }}>
              {viewMode === 'draw' ? (editingThemeId ? 'Duvar Kağıdını & Renkleri Düzenle' : 'Duvar Kağıdı Çizim & Renk Stüdyosu') : 'Tema & Duvar Kağıdı Seçici'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {viewMode === 'draw' ? (
              <button
                onClick={() => { setEditingThemeId(null); setViewMode('quick'); }}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#cbd5e1', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer'
                }}
              >
                ← Listeye Dön
              </button>
            ) : (
              <button
                onClick={() => { setEditingThemeId(null); setViewMode('draw'); }}
                style={{
                  background: 'rgba(168,85,247,0.18)', border: '1px solid #a855f7',
                  color: '#c084fc', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: '600',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                <Plus size={12} /> Yeni Duvar Kağıdı Çiz
              </button>
            )}

            <button
              onClick={onClose}
              title="Kapat"
              style={{
                background: 'rgba(255,255,255,0.06)', border: 'none',
                color: '#94a3b8', borderRadius: '8px', padding: '6px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Başarı / Bilgi Bildirimi */}
        {backupSuccessMsg && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.18)', borderBottom: '1px solid rgba(34, 197, 94, 0.3)',
            padding: '6px 14px', fontSize: '11px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '6px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <Check size={12} />
            <span>{backupSuccessMsg}</span>
          </div>
        )}

        {/* 1. GÖRÜNÜM: TEK SEKMEDE ŞİPŞAK TEMA SEÇİCİ & YEDEKLEME */}
        {viewMode === 'quick' && (
          <div style={{ padding: '16px 18px', overflowY: 'auto', flex: 1, maxHeight: '68vh' }}>
            
            {/* ÜST ARAÇ ÇUBUĞU */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '10px 14px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#f1f5f9' }}>
                  🎨 Duvar Kağıtları ({savedThemes.length})
                </span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                  (Seçtiğinizde gruptaki herkese yansır)
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => { setEditingThemeId(null); setViewMode('draw'); }}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none', color: '#fff', borderRadius: '6px',
                    padding: '4px 10px', fontSize: '10.5px', fontWeight: '700',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                    boxShadow: '0 2px 8px rgba(99,102,241,0.35)'
                  }}
                >
                  <Plus size={12} /> Yeni Çiz
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Dosyadan veya Fotoğraftan Tema Yükle"
                  style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#cbd5e1', borderRadius: '6px', padding: '4px 8px', fontSize: '10.5px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px'
                  }}
                >
                  <Upload size={11} /> Yükle
                </button>

                <button
                  onClick={handleExportAllThemes}
                  title="Temaları .chiclet Dosyasına Kaydet"
                  style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#cbd5e1', borderRadius: '6px', padding: '4px 8px', fontSize: '10.5px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px'
                  }}
                >
                  <Download size={11} /> Yedekle
                </button>
              </div>
            </div>

            {/* Özel Çizilmiş Duvar Kağıtları Listesi */}
            {savedThemes.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {savedThemes.map(theme => {
                  const isSelected = currentTheme?.id === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => { onSelectTheme(theme); onClose(); }}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: isSelected ? `2px solid ${theme.accentColor}` : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        padding: '10px',
                        cursor: 'pointer',
                        boxShadow: isSelected ? `0 0 16px ${theme.glowColor}` : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        transition: 'all 0.15s'
                      }}
                    >
                      {theme.customWallpaper && (
                        <div style={{
                          height: '60px', borderRadius: '8px',
                          backgroundImage: `url(${theme.customWallpaper})`,
                          backgroundSize: 'cover', backgroundPosition: 'center',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }} />
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#f1f5f9' }}>
                          {theme.name}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {isSelected && <span style={{ fontSize: '10px', color: '#4ade80', fontWeight: 'bold' }}>✓</span>}

                          <button
                            onClick={(e) => handleStartEditTheme(theme, e)}
                            title="Duvar Kağıdını & Renkleri Düzenle"
                            style={{
                              background: 'rgba(168,85,247,0.2)', border: '1px solid #a855f7',
                              color: '#c084fc', borderRadius: '4px', padding: '3px 5px', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '2px', fontSize: '10px'
                            }}
                          >
                            <Edit3 size={11} /> Düzenle
                          </button>

                          <button
                            onClick={(e) => handleDownloadSingleTheme(theme, e)}
                            title="Resim Olarak İndir"
                            style={{
                              background: 'rgba(255,255,255,0.08)', border: 'none',
                              color: '#cbd5e1', borderRadius: '4px', padding: '3px', cursor: 'pointer'
                            }}
                          >
                            <Download size={11} />
                          </button>

                          <button
                            onClick={(e) => handleDelete(theme.id, e)}
                            title="Sil"
                            style={{
                              background: 'rgba(239,68,68,0.15)', border: 'none',
                              color: '#f87171', borderRadius: '4px', padding: '3px', cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                padding: '30px 20px', textAlign: 'center',
                background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
                border: '1px dashed rgba(255,255,255,0.1)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
              }}>
                <Palette size={32} color="#6366f1" style={{ opacity: 0.7 }} />
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9' }}>
                  Henüz özel bir duvar kağıdı oluşturmadın
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', maxWidth: '280px', lineHeight: '1.5' }}>
                  Kendi resmini çizebilir, çıkartmalar ekleyebilir veya bilgisayarından bir fotoğraf yükleyebilirsin.
                </div>
                <button
                  onClick={() => { setEditingThemeId(null); setViewMode('draw'); }}
                  style={{
                    marginTop: '6px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none', color: '#fff', borderRadius: '8px',
                    padding: '6px 14px', fontSize: '11px', fontWeight: '700',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                  }}
                >
                  <Plus size={13} /> İlk Duvar Kağıdını Çiz
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. GÖRÜNÜM: ÇİZİM & RENK ÖZELLEŞTİRME STÜDYOSU */}
        {viewMode === 'draw' && (
          <div style={{ padding: '16px 18px', overflowY: 'auto', flex: 1, display: 'flex', gap: '16px' }}>
            
            {/* SOL: TUVAL & ÖNİZLEME */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                position: 'relative',
                width: '320px',
                height: '380px',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1.5px solid rgba(255,255,255,0.15)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                cursor: activeTool === 'sticker' ? 'crosshair' : activeTool === 'eraser' ? 'cell' : 'crosshair'
              }}>
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={380}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  style={{ display: 'block', width: '100%', height: '100%' }}
                />

                {stickersOnCanvas.map(s => (
                  <div
                    key={s.id}
                    style={{
                      position: 'absolute', left: `${s.x}px`, top: `${s.y}px`,
                      fontSize: '28px', pointerEvents: 'none', userSelect: 'none',
                      filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.7))'
                    }}
                  >
                    {s.emoji}
                  </div>
                ))}

                {showLivePreview && (
                  <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: 'rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column',
                    justifyContent: 'space-between', padding: '10px'
                  }}>
                    <div style={{
                      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                      padding: '4px 8px', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#fff' }}>Chiclet Sohbet</span>
                      <span style={{ fontSize: '9px', color: userBubbleColor }}>@{themeName}</span>
                    </div>

                    {/* Canlı Mesaj Baloncukları */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{
                        alignSelf: 'flex-start',
                        background: aiBubbleColor,
                        backdropFilter: 'blur(6px)',
                        border: `1px solid ${userBubbleColor}40`,
                        borderRadius: '8px', padding: '4px 8px', fontSize: '10px', color: '#cbd5e1'
                      }}>
                        🤖 @ai: Mesaj renkleriniz harika görünüyor!
                      </div>
                      <div style={{
                        alignSelf: 'flex-end',
                        background: `linear-gradient(135deg, ${userBubbleColor}, ${userBubbleEndColor})`,
                        borderRadius: '8px', padding: '4px 8px', fontSize: '10px', color: '#fff',
                        boxShadow: `0 2px 8px ${userBubbleColor}60`
                      }}>
                        Kendi renk ve çizim kombinasyonum 🔥
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', color: '#64748b' }}>
                      Mesaj yaz...
                    </div>
                  </div>
                )}
              </div>

              {/* Tuval Alt Araçları */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={handleUndo} title="Geri Al" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '5px 8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                    <RotateCcw size={12} /> Geri Al
                  </button>

                  <button
                    onClick={() => canvasImageInputRef.current?.click()}
                    title="Bilgisayardan Fotoğraf Yükle"
                    style={{
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#cbd5e1', padding: '5px 8px', borderRadius: '8px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px'
                    }}
                  >
                    <ImageIcon size={12} /> Fotoğraf Ekle
                  </button>

                  <button onClick={handleClear} title="Temizle" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '5px 8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                    <Trash2 size={12} /> Temizle
                  </button>
                </div>

                <button
                  onClick={() => setShowLivePreview(!showLivePreview)}
                  style={{
                    background: showLivePreview ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${showLivePreview ? '#a855f7' : 'rgba(255,255,255,0.1)'}`,
                    color: showLivePreview ? '#c084fc' : '#94a3b8',
                    padding: '5px 8px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px'
                  }}
                >
                  {showLivePreview ? '👁️ Sohbeti Gizle' : '👁️ Sohbeti Göster'}
                </button>
              </div>
            </div>

            {/* SAĞ: ARAÇLAR & MESAJLAŞMA RENK AYARLARI */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', display: 'block', marginBottom: '3px' }}>
                  Tema Adı:
                </label>
                <input
                  type="text"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  placeholder="Örn: Yıldızlı Kolaj..."
                  style={{
                    width: '100%', padding: '6px 10px', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px',
                    color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* MESAJ BALONU RENK AYARLARI */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <label style={{ fontSize: '11px', color: '#c084fc', fontWeight: '700' }}>
                  💬 Mesajlaşma Balon Renkleri:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Kullanıcı Balonu:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input type="color" value={userBubbleColor} onChange={(e) => setUserBubbleColor(e.target.value)} style={{ width: '22px', height: '22px', border: 'none', cursor: 'pointer', background: 'transparent' }} />
                      <input type="color" value={userBubbleEndColor} onChange={(e) => setUserBubbleEndColor(e.target.value)} style={{ width: '22px', height: '22px', border: 'none', cursor: 'pointer', background: 'transparent' }} />
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>@ai Balon Rengi:</span>
                    <input type="color" value={aiBubbleColor.startsWith('#') ? aiBubbleColor : '#1e293b'} onChange={(e) => setAiBubbleColor(e.target.value)} style={{ width: '22px', height: '22px', border: 'none', cursor: 'pointer', background: 'transparent' }} />
                  </div>
                </div>
              </div>

              {/* Araç Seçici: Fırça / Silgi / Çıkartma */}
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                  Çizim Aracı:
                </label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    onClick={() => setActiveTool('brush')}
                    style={{
                      flex: 1, padding: '6px', borderRadius: '7px', cursor: 'pointer',
                      background: activeTool === 'brush' ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${activeTool === 'brush' ? '#a855f7' : 'rgba(255,255,255,0.08)'}`,
                      color: activeTool === 'brush' ? '#c084fc' : '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '11px', fontWeight: '600'
                    }}
                  >
                    <Brush size={11} /> Fırça
                  </button>
                  <button
                    onClick={() => setActiveTool('eraser')}
                    style={{
                      flex: 1, padding: '6px', borderRadius: '7px', cursor: 'pointer',
                      background: activeTool === 'eraser' ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${activeTool === 'eraser' ? '#a855f7' : 'rgba(255,255,255,0.08)'}`,
                      color: activeTool === 'eraser' ? '#c084fc' : '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '11px', fontWeight: '600'
                    }}
                  >
                    <Eraser size={11} /> Silgi
                  </button>
                  <button
                    onClick={() => setActiveTool('sticker')}
                    style={{
                      flex: 1, padding: '6px', borderRadius: '7px', cursor: 'pointer',
                      background: activeTool === 'sticker' ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${activeTool === 'sticker' ? '#a855f7' : 'rgba(255,255,255,0.08)'}`,
                      color: activeTool === 'sticker' ? '#c084fc' : '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '11px', fontWeight: '600'
                    }}
                  >
                    <Smile size={11} /> Çıkartma
                  </button>
                </div>
              </div>

              {/* Çıkartma Seçimi */}
              {activeTool === 'sticker' && (
                <div>
                  <label style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                    Çıkartma Seç (Tuvale Tıkla):
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '8px' }}>
                    {STICKER_LIBRARY.map(s => (
                      <button
                        key={s} onClick={() => setSelectedSticker(s)}
                        style={{
                          background: selectedSticker === s ? 'rgba(168,85,247,0.3)' : 'transparent',
                          border: selectedSticker === s ? '1px solid #a855f7' : 'none',
                          borderRadius: '5px', fontSize: '18px', padding: '3px', cursor: 'pointer'
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Fırça Seçimi */}
              {activeTool !== 'sticker' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>Fırça Rengi:</label>
                    <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} style={{ width: '20px', height: '20px', border: 'none', cursor: 'pointer', background: 'transparent' }} />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                    {PALETTE_COLORS.map(c => (
                      <button
                        key={c} onClick={() => setBrushColor(c)}
                        style={{
                          width: '18px', height: '18px', borderRadius: '4px',
                          background: c, border: brushColor === c ? '2px solid #fff' : '1px solid rgba(0,0,0,0.3)',
                          cursor: 'pointer', transform: brushColor === c ? 'scale(1.15)' : 'scale(1)'
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <label style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span>Fırça Kalınlığı:</span><span>{brushSize}px</span>
                    </label>
                    <input type="range" min="2" max="24" step="1" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#a855f7', cursor: 'pointer' }} />
                  </div>
                </div>
              )}

              {/* Zemin Rengi */}
              <div>
                <label style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Zemin Rengi:</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {CANVAS_BACKGROUNDS.map(bg => (
                    <button
                      key={bg.label} onClick={() => changeCanvasBg(bg)}
                      style={{
                        flex: 1, padding: '4px 2px', borderRadius: '6px', background: bg.color,
                        border: canvasBg.label === bg.label ? '1.5px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                        color: '#cbd5e1', fontSize: '9px', cursor: 'pointer'
                      }}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kaydet Butonu */}
              <button
                onClick={handleSaveAndApplyWallpaper}
                style={{
                  marginTop: 'auto', padding: '10px',
                  background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                  border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px', fontWeight: '700',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  boxShadow: '0 4px 18px rgba(168,85,247,0.4)'
                }}
              >
                <Sparkles size={13} /> {editingThemeId ? 'Değişiklikleri Kaydet & Uygula' : 'Duvar Kağıdı & Renkleri Kaydet'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
