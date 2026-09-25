import React, { useState, useRef, useEffect } from 'react';
import {
  PRESET_THEMES,
  getSavedCustomThemes,
  saveCustomTheme,
  deleteCustomTheme
} from '../services/ThemeService';
import { Upload, Download, Plus, ArrowLeft } from 'lucide-react';
import chicletLogo from '../assets/ChicletLogoNew.jpg';
import CizimIcon from '../assets/CizimIcon.png';
import SilgiIcon from '../assets/SilgiIcon.png';
import EmojiIcon from '../assets/EmojiIcon.png';
import GeriAlIcon from '../assets/GeriAlIcon.png';
import FotografEkleIcon from '../assets/FotografEkleIcon.png';
import TemizleIcon from '../assets/TemizleIcon.png';
import SohbetiGizleIcon from '../assets/SohbetiGizleIconpng.png';

const STICKER_LIBRARY = [
  '🌸', '✨', '⚡', '👑', '🎮', '🐱', '🚀', '🍄',
  '👾', '☕', '💎', '🍕', '🫧', '🌈', '🧸', '🌙',
  '🎨', '🍉', '🕹️', '🐸', '🦆', '🔥', '💀', '💜',
  '🎀', '⭐', '🎈', '🍭', '🍓', '🍰', '🧁', '🍦'
];

// İçi tamamen renkle dolu özel daire renk seçici
function ColorPickerCircle({ value, onChange, size = 26, title }) {
  const inputRef = useRef(null);
  return (
    <div
      onClick={() => inputRef.current?.click()}
      title={title}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: value,
        border: '1.5px solid #000000',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        position: 'relative',
        flexShrink: 0,
        transition: 'transform 0.1s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <input
        ref={inputRef}
        type="color"
        value={value.startsWith('#') ? value : '#ffffff'}
        onChange={e => onChange(e.target.value)}
        style={{
          position: 'absolute',
          opacity: 0,
          width: 0,
          height: 0,
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}

export default function ThemeStudioModal({ currentTheme, onSelectTheme, onClose, initialView = 'draw' }) {
  const [viewMode, setViewMode] = useState(initialView); // 'draw' | 'quick'
  const [savedThemes, setSavedThemes] = useState(getSavedCustomThemes());
  const [backupSuccessMsg, setBackupSuccessMsg] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Çizim & Renk Araçları
  const [activeTool, setActiveTool] = useState('brush'); // 'brush' | 'eraser' | 'sticker'
  const [brushColor, setBrushColor] = useState('#000000');
  const [bucketColor, setBucketColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(5);
  const [selectedSticker, setSelectedSticker] = useState('✨');
  const [themeName, setThemeName] = useState('Yeni Çizimim');
  const [editingThemeId, setEditingThemeId] = useState(null);

  // Mesaj Balonu Renkleri
  const [userBubbleColor, setUserBubbleColor] = useState('#9de3fe');
  const [userBubbleEndColor, setUserBubbleEndColor] = useState('#a2e5ff');
  const [aiBubbleColor, setAiBubbleColor] = useState('#ffffff');

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
      ctx.fillStyle = bucketColor;
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
    ctx.fillStyle = bucketColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setStickersOnCanvas([]);
    saveState([]);
  };

  const changeBucketColor = (color) => {
    setBucketColor(color);
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState(stickersOnCanvas);
  };

  const handleStartEditTheme = (theme, e) => {
    e.stopPropagation();
    setEditingThemeId(theme.id);
    setThemeName(theme.name);
    if (theme.accentColor) setBrushColor(theme.accentColor);
    if (theme.userBubbleBg) setUserBubbleColor(theme.userBubbleBg);
    if (theme.userBubbleEnd) setUserBubbleEndColor(theme.userBubbleEnd);
    if (theme.aiBubbleBg) setAiBubbleColor(theme.aiBubbleBg);
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

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    if (activeTool === 'sticker') {
      const pos = getCanvasPos(e);
      const newStk = {
        id: Date.now(),
        emoji: selectedSticker,
        x: pos.x - 14,
        y: pos.y - 14
      };
      const updated = [...stickersOnCanvas, newStk];
      setStickersOnCanvas(updated);
      saveState(updated);
      return;
    }
    isDrawing.current = true;
    lastPos.current = getCanvasPos(e);
  };

  const draw = (e) => {
    if (!isDrawing.current || activeTool === 'sticker') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const curPos = getCanvasPos(e);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(curPos.x, curPos.y);

    if (activeTool === 'eraser') {
      ctx.strokeStyle = bucketColor;
      ctx.lineWidth = brushSize * 3;
    } else {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPos.current = curPos;
  };

  const stopDrawing = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      saveState();
    }
  };

  const handleSaveAndApplyWallpaper = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    stickersOnCanvas.forEach(s => {
      ctx.font = '28px sans-serif';
      ctx.fillText(s.emoji, s.x, s.y + 24);
    });

    const finalData = canvas.toDataURL('image/png');
    const newTheme = {
      id: editingThemeId || ('custom_' + Date.now()),
      name: themeName.trim() || 'Özel Çizim',
      accentColor: brushColor,
      userBubbleBg: userBubbleColor,
      userBubbleEnd: userBubbleEndColor,
      aiBubbleBg: aiBubbleColor,
      customWallpaper: finalData,
      isCustom: true
    };
    saveCustomTheme(newTheme);
    setSavedThemes(getSavedCustomThemes());
    onSelectTheme(newTheme);
    onClose();
  };

  const handleLoadImageToCanvas = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveState();
      };
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleExportAllThemes = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedThemes));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `chiclet-temalar-${new Date().toISOString().slice(0,10)}.chiclet`);
    dlAnchor.click();
    setBackupSuccessMsg('Temalar başarıyla yedeklendi!');
    setTimeout(() => setBackupSuccessMsg(null), 3000);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          parsed.forEach(t => saveCustomTheme(t));
          setSavedThemes(getSavedCustomThemes());
          setBackupSuccessMsg(`${parsed.length} adet tema içe aktarıldı!`);
          setTimeout(() => setBackupSuccessMsg(null), 3000);
        }
      } catch (_) {}
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ─── Sürüklenebilir Panel ────────────────────────────────────────────────────
  const modalWidth = viewMode === 'draw' ? 710 : 620;
  const modalHeight = viewMode === 'draw' ? 480 : 440;

  const [modalPos, setModalPos] = useState(() => ({
    x: Math.round(window.innerWidth / 2 - modalWidth / 2),
    y: Math.round(window.innerHeight / 2 - modalHeight / 2)
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
        x: Math.max(0, Math.min(window.innerWidth - modalWidth, ev.clientX - modalDragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - modalHeight, ev.clientY - modalDragOffset.current.y))
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

  // Buton Hover Efektleri
  const hoverBtn = {
    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
    cursor: 'pointer'
  };
  const onHoverUp = (e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.2)'; };
  const onHoverOut = (e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; };
  const onMouseDownAnim = (e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.97)'; };

  return (
    <div
      data-chiclet="true"
      style={{
        position: 'fixed',
        left: `${modalPos.x}px`,
        top: `${modalPos.y}px`,
        zIndex: 10000,
        pointerEvents: 'auto'
      }}
    >
      <input type="file" ref={fileInputRef} onChange={handleImportFile} accept=".chiclet,.json,image/*" style={{ display: 'none' }} />
      <input type="file" ref={canvasImageInputRef} onChange={handleLoadImageToCanvas} accept="image/*" style={{ display: 'none' }} />

      {/* Ana Çerçeve (Bembeyaz değil, Chiclet pembe/pastel gradyanı) */}
      <div style={{
        width: modalWidth,
        height: modalHeight,
        position: 'relative',
        background: 'linear-gradient(137deg, #FFF5F7 0%, #FEE8EE 100%)',
        overflow: 'hidden',
        borderRadius: 14,
        boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
        border: '1.5px solid #000000',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease, height 0.2s ease'
      }}>

        {/* Üst Titlebar */}
        <div
          onMouseDown={onModalHeaderMouseDown}
          style={{
            height: 42,
            margin: '8px 8px 0 8px',
            background: '#F3A6BA',
            boxShadow: '2px 4px 4px 1px rgba(0, 0, 0, 0.40)',
            borderRadius: 8,
            outline: '1px black solid',
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 27,
              height: 27,
              background: 'white',
              borderRadius: 6,
              outline: '1px black solid',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img style={{ width: 31, height: 31 }} src={chicletLogo} alt="Logo" draggable={false} />
            </div>
            <span style={{ color: 'black', fontSize: 14, fontFamily: 'Poppins', fontWeight: '700' }}>
              {viewMode === 'draw' ? 'Yeni Duvar Kağıdı' : 'Duvar Kağıtlarım'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Liste / Çizim Geçiş Butonu — Başında Ok İkonu */}
            <button
              onClick={() => { setDeleteConfirmId(null); setViewMode(viewMode === 'draw' ? 'quick' : 'draw'); }}
              title={viewMode === 'draw' ? 'Kayıtlı Duvar Kağıtları Listesi' : 'Çizim Ekranına Dön'}
              style={{
                background: 'linear-gradient(136deg, #FCEBEF 0%, #BDE2EF 100%)',
                borderRadius: 8,
                border: '1px black solid',
                padding: '4px 12px',
                fontSize: 12,
                fontFamily: 'Poppins',
                fontWeight: '700',
                color: 'black',
                boxShadow: '1px 1px 3px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                ...hoverBtn
              }}
              onMouseEnter={onHoverUp}
              onMouseLeave={onHoverOut}
              onMouseDown={onMouseDownAnim}
            >
              <ArrowLeft size={13} strokeWidth={2.5} />
              <span>{viewMode === 'draw' ? 'Duvar Kağıtlarım' : 'Yeni Çizim'}</span>
            </button>

            {/* Kapat Butonu */}
            <button
              onClick={onClose}
              title="Kapat"
              style={{
                width: 26,
                height: 26,
                background: '#F19191',
                boxShadow: '1px 1px 4px rgba(0, 0, 0, 0.30), 0px 1px 3px rgba(0, 0, 0, 0.25) inset',
                borderRadius: 8,
                border: '1px black solid',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: '700',
                color: '#1E1E1E',
                padding: 0,
                ...hoverBtn
              }}
              onMouseEnter={onHoverUp}
              onMouseLeave={onHoverOut}
              onMouseDown={onMouseDownAnim}
            >
              &#10005;
            </button>
          </div>
        </div>

        {/* ─── 1. GÖRÜNÜM: ÇİZİM MODU (Normal Chat Oranları) ─── */}
        {viewMode === 'draw' && (
          <div style={{
            flex: 1,
            display: 'flex',
            padding: '10px 14px',
            gap: 14,
            overflow: 'hidden'
          }}>
            {/* SOL ALAN: Normal Chat Boyutunda Çizim & Canlı Önizleme */}
            <div style={{
              width: 320,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              flexShrink: 0
            }}>
              {/* Tuval Container (Normal Chat Boyutu: 320x370) */}
              <div style={{
                width: 320,
                height: 370,
                position: 'relative',
                background: bucketColor,
                borderRadius: 12,
                outline: '1.5px black solid',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
              }}>
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={370}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    cursor: activeTool === 'sticker' ? 'crosshair' : activeTool === 'eraser' ? 'cell' : 'crosshair'
                  }}
                />

                {stickersOnCanvas.map(s => (
                  <div
                    key={s.id}
                    style={{
                      position: 'absolute', left: `${s.x}px`, top: `${s.y}px`,
                      fontSize: '28px', pointerEvents: 'none', userSelect: 'none',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                    }}
                  >
                    {s.emoji}
                  </div>
                ))}

                {/* Tuval İçi Canlı Önizleme */}
                {showLivePreview && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '8px'
                  }}>
                    {/* Üst Bar Önizlemesi */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255,255,255,0.85)',
                      borderRadius: 8,
                      padding: '4px 8px',
                      border: '1px solid rgba(0,0,0,0.15)'
                    }}>
                      <span style={{ fontSize: 12, fontFamily: 'Poppins', fontWeight: '700', color: '#000' }}>
                        Chiclet
                      </span>
                      <span style={{
                        fontSize: 10,
                        fontFamily: 'Poppins',
                        fontWeight: '600',
                        background: '#D9D9D9',
                        border: '1px solid #000',
                        borderRadius: 6,
                        padding: '1px 6px',
                        color: '#000'
                      }}>
                        {themeName || 'Yeni Çizimim'}
                      </span>
                    </div>

                    {/* Canlı Mesaj Baloncukları */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto', marginBottom: 8 }}>
                      <div style={{
                        alignSelf: 'flex-start',
                        background: aiBubbleColor,
                        border: '1.5px solid #000',
                        borderRadius: 10,
                        padding: '5px 9px',
                        fontSize: 11,
                        fontFamily: 'Poppins',
                        fontWeight: '600',
                        color: '#000',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                      }}>
                        🤖 @ai: Renkler ve çizimin harika görünüyor!
                      </div>
                      <div style={{
                        alignSelf: 'flex-end',
                        background: userBubbleColor,
                        border: '1.5px solid #000',
                        borderRadius: 10,
                        padding: '5px 9px',
                        fontSize: 11,
                        fontFamily: 'Poppins',
                        fontWeight: '600',
                        color: '#000',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                      }}>
                        Kendi duvar kağıdım ve balon renklerim 🎀
                      </div>
                    </div>

                    {/* Tuval İçi Mesaj Yazma Alanı */}
                    <div style={{
                      height: 32,
                      background: '#FFD2D3',
                      border: '1px solid #000',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      <div style={{
                        flex: 1,
                        height: 22,
                        background: '#FCEDF1',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 8px',
                        color: 'rgba(0,0,0,0.65)',
                        fontSize: 11,
                        fontFamily: 'Poppins',
                        fontWeight: '500'
                      }}>
                        Mesaj yaz veya / bas
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tuval Altında Sohbeti Gizle Butonu (Sağa Yaslı, Tek İkon) */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowLivePreview(!showLivePreview)}
                  title="Önizleme Baloncuklarını Aç/Kapat"
                  style={{
                    background: 'white',
                    border: '1px solid #000',
                    borderRadius: 8,
                    padding: '3px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 11,
                    fontFamily: 'Poppins',
                    fontWeight: '600',
                    color: '#000',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    ...hoverBtn
                  }}
                  onMouseEnter={onHoverUp}
                  onMouseLeave={onHoverOut}
                  onMouseDown={onMouseDownAnim}
                >
                  <img src={SohbetiGizleIcon} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />
                  <span>{showLivePreview ? 'Sohbeti gizle' : 'Sohbeti göster'}</span>
                </button>
              </div>
            </div>

            {/* SAĞ ALAN: Ferah Kontrol Paneli */}
            <div style={{
              flex: 1,
              background: 'linear-gradient(155deg, rgba(255, 217, 227, 0.70) 0%, rgba(183, 233, 255, 0.70) 100%)',
              border: '1px solid #FFE8E8',
              borderRadius: 14,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              boxSizing: 'border-box'
            }}>
              {/* Tema Adı */}
              <div>
                <label style={{ fontSize: 11, fontFamily: 'Poppins', fontWeight: '700', color: '#000', display: 'block', marginBottom: 4 }}>
                  Tema Adı
                </label>
                <input
                  type="text"
                  value={themeName}
                  onChange={e => setThemeName(e.target.value)}
                  placeholder="Tema Adı..."
                  style={{
                    width: '100%',
                    height: 30,
                    background: '#FCF2F5',
                    border: '1px solid #000',
                    borderRadius: 8,
                    padding: '0 10px',
                    fontSize: 12,
                    fontFamily: 'Poppins',
                    fontWeight: '600',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Mesajlaşma Balonu Renkleri (Tam Renk Dolgulu Yuvarlaklar) */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.65)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 10,
                padding: '8px 12px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
              }}>
                <div style={{ fontSize: 11, fontFamily: 'Poppins', fontWeight: '700', color: '#000', marginBottom: 6 }}>
                  Mesajlaşma balonu renkleri
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: 10, fontFamily: 'Poppins', fontWeight: '600', color: '#333', display: 'block', marginBottom: 3 }}>
                      Kullanıcı balonu:
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <ColorPickerCircle
                        value={userBubbleColor}
                        onChange={setUserBubbleColor}
                        size={26}
                        title="Kullanıcı Balonu Başlangıç Rengi"
                      />
                      <ColorPickerCircle
                        value={userBubbleEndColor}
                        onChange={setUserBubbleEndColor}
                        size={26}
                        title="Kullanıcı Balonu Bitiş Rengi"
                      />
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, fontFamily: 'Poppins', fontWeight: '600', color: '#333', display: 'block', marginBottom: 3 }}>
                      Ai Balonu:
                    </span>
                    <ColorPickerCircle
                      value={aiBubbleColor}
                      onChange={setAiBubbleColor}
                      size={26}
                      title="AI Balonu Rengi"
                    />
                  </div>
                </div>
              </div>

              {/* Çizim Aracı Başlığı & 1. Satır Butonlar (linear-gradient(66deg, white 0%, #FCEDF1 100%)) */}
              <div>
                <div style={{ fontSize: 11, fontFamily: 'Poppins', fontWeight: '700', color: '#000', marginBottom: 5 }}>
                  Çizim Aracı
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {/* Fırça */}
                  <button
                    onClick={() => setActiveTool('brush')}
                    style={{
                      flex: 1,
                      height: 30,
                      background: activeTool === 'brush' ? '#A2E5FF' : 'linear-gradient(66deg, white 0%, #FCEDF1 100%)',
                      border: activeTool === 'brush' ? '1.5px solid #000' : '1px solid rgba(0,0,0,0.25)',
                      boxShadow: activeTool === 'brush' ? '0 0 0 1px #A2E5FF, 0 2px 4px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      fontSize: 11,
                      fontFamily: 'Poppins',
                      fontWeight: '600',
                      ...hoverBtn
                    }}
                    onMouseEnter={onHoverUp}
                    onMouseLeave={onHoverOut}
                    onMouseDown={onMouseDownAnim}
                  >
                    <img src={CizimIcon} alt="" style={{ width: 15, height: 15, objectFit: 'contain' }} />
                    <span>Fırça</span>
                  </button>

                  {/* Silgi */}
                  <button
                    onClick={() => setActiveTool('eraser')}
                    style={{
                      flex: 1,
                      height: 30,
                      background: activeTool === 'eraser' ? '#A2E5FF' : 'linear-gradient(66deg, white 0%, #FCEDF1 100%)',
                      border: activeTool === 'eraser' ? '1.5px solid #000' : '1px solid rgba(0,0,0,0.25)',
                      boxShadow: activeTool === 'eraser' ? '0 0 0 1px #A2E5FF, 0 2px 4px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      fontSize: 11,
                      fontFamily: 'Poppins',
                      fontWeight: '600',
                      ...hoverBtn
                    }}
                    onMouseEnter={onHoverUp}
                    onMouseLeave={onHoverOut}
                    onMouseDown={onMouseDownAnim}
                  >
                    <img src={SilgiIcon} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />
                    <span>Silgi</span>
                  </button>

                  {/* Çıkartma */}
                  <button
                    onClick={() => setActiveTool(activeTool === 'sticker' ? 'brush' : 'sticker')}
                    style={{
                      flex: 1,
                      height: 30,
                      background: activeTool === 'sticker' ? '#A2E5FF' : 'linear-gradient(66deg, white 0%, #FCEDF1 100%)',
                      border: activeTool === 'sticker' ? '1.5px solid #000' : '1px solid rgba(0,0,0,0.25)',
                      boxShadow: activeTool === 'sticker' ? '0 0 0 1px #A2E5FF, 0 2px 4px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      fontSize: 11,
                      fontFamily: 'Poppins',
                      fontWeight: '600',
                      ...hoverBtn
                    }}
                    onMouseEnter={onHoverUp}
                    onMouseLeave={onHoverOut}
                    onMouseDown={onMouseDownAnim}
                  >
                    <img src={EmojiIcon} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />
                    <span>Çıkartma</span>
                  </button>
                </div>
              </div>

              {/* Çıkartma Modu Açıkken: Geniş ve Ferah Çıkartma Seçici Paneli */}
              {activeTool === 'sticker' ? (
                <div style={{
                  background: 'rgba(255,255,255,0.85)',
                  border: '1.5px solid #000',
                  borderRadius: 10,
                  padding: 8,
                  height: 100,
                  overflowY: 'auto',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  alignContent: 'flex-start',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {STICKER_LIBRARY.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSticker(s)}
                      style={{
                        background: selectedSticker === s ? '#A2E5FF' : 'white',
                        border: selectedSticker === s ? '1.5px solid #000' : '1px solid rgba(0,0,0,0.15)',
                        borderRadius: 8,
                        fontSize: 22,
                        padding: '4px 6px',
                        cursor: 'pointer',
                        lineHeight: 1,
                        transition: 'transform 0.1s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                /* Fırça & Kova Modu Açıkken: Renkler ve Fırça Kalınlığı (Boyut Göstergeli) */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: 100, justifyContent: 'center' }}>
                  {/* Fırça & Kova Renkleri */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontFamily: 'Poppins', fontWeight: '600', color: '#000' }}>
                        Fırça rengi:
                      </span>
                      <ColorPickerCircle
                        value={brushColor}
                        onChange={setBrushColor}
                        size={24}
                        title="Fırça Rengi Seç"
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontFamily: 'Poppins', fontWeight: '600', color: '#000' }}>
                        Kova rengi:
                      </span>
                      <ColorPickerCircle
                        value={bucketColor}
                        onChange={changeBucketColor}
                        size={24}
                        title="Arka Plan Dolgu Rengi Seç"
                      />
                    </div>
                  </div>

                  {/* Fırça Kalınlığı Slider (Boyutu Açıkça Yazan Rozetli) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontFamily: 'Poppins', fontWeight: '600', color: '#000', whiteSpace: 'nowrap' }}>
                      Fırça kalınlığı:
                    </span>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={brushSize}
                      onChange={e => setBrushSize(parseInt(e.target.value))}
                      style={{ flex: 1, height: 6, accentColor: '#7FA5E2', cursor: 'pointer' }}
                    />
                    <span style={{
                      fontSize: 11,
                      fontFamily: 'Poppins',
                      fontWeight: '700',
                      background: '#fff',
                      border: '1px solid #000',
                      borderRadius: 6,
                      padding: '1px 6px',
                      color: '#000',
                      minWidth: 32,
                      textAlign: 'center'
                    }}>
                      {brushSize}px
                    </span>
                  </div>
                </div>
              )}

              {/* Ayırıcı Çizgi */}
              <div style={{ width: '100%', height: 0, outline: '1px #94C8FF solid' }} />

              {/* 2. Satır Araçlar: Geri al, Fotoğraf ekle, Temizle (linear-gradient(44deg, #FCEBEF 0%, #BDE2EF 100%)) */}
              <div style={{ display: 'flex', gap: 8 }}>
                {/* Geri al */}
                <button
                  onClick={handleUndo}
                  title="Son Çizimi Geri Al"
                  style={{
                    flex: 1,
                    height: 30,
                    background: 'linear-gradient(44deg, #FCEBEF 0%, #BDE2EF 100%)',
                    border: '1px solid rgba(0,0,0,0.25)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    fontSize: 11,
                    fontFamily: 'Poppins',
                    fontWeight: '600',
                    ...hoverBtn
                  }}
                  onMouseEnter={onHoverUp}
                  onMouseLeave={onHoverOut}
                  onMouseDown={onMouseDownAnim}
                >
                  <img src={GeriAlIcon} alt="" style={{ width: 13, height: 13, objectFit: 'contain' }} />
                  <span>Geri al</span>
                </button>

                {/* Fotoğraf ekle */}
                <button
                  onClick={() => canvasImageInputRef.current?.click()}
                  title="Bilgisayarından Fotoğraf Yükle"
                  style={{
                    flex: 1.3,
                    height: 30,
                    background: 'linear-gradient(44deg, #FCEBEF 0%, #BDE2EF 100%)',
                    border: '1px solid rgba(0,0,0,0.25)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    fontSize: 11,
                    fontFamily: 'Poppins',
                    fontWeight: '600',
                    ...hoverBtn
                  }}
                  onMouseEnter={onHoverUp}
                  onMouseLeave={onHoverOut}
                  onMouseDown={onMouseDownAnim}
                >
                  <img src={FotografEkleIcon} alt="" style={{ width: 13, height: 13, objectFit: 'contain' }} />
                  <span>Fotoğraf</span>
                </button>

                {/* Temizle */}
                <button
                  onClick={handleClear}
                  title="Tuvali Temizle"
                  style={{
                    flex: 1,
                    height: 30,
                    background: 'linear-gradient(44deg, #FCEBEF 0%, #BDE2EF 100%)',
                    border: '1px solid rgba(0,0,0,0.25)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    fontSize: 11,
                    fontFamily: 'Poppins',
                    fontWeight: '600',
                    ...hoverBtn
                  }}
                  onMouseEnter={onHoverUp}
                  onMouseLeave={onHoverOut}
                  onMouseDown={onMouseDownAnim}
                >
                  <img src={TemizleIcon} alt="" style={{ width: 13, height: 13, objectFit: 'contain' }} />
                  <span>Temizle</span>
                </button>
              </div>

              {/* Duvar Kağıdını Kaydet Butonu (Dışa Doğru Belirgin Gölge) */}
              <button
                onClick={handleSaveAndApplyWallpaper}
                title="Kaydet ve Uygula"
                style={{
                  width: '100%',
                  height: 38,
                  marginTop: 'auto',
                  background: '#A2E5FF',
                  boxShadow: '0 6px 16px rgba(162, 229, 255, 0.75), 0 2px 4px rgba(0, 0, 0, 0.18)',
                  borderRadius: 12,
                  border: '1.5px solid #000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'black',
                  fontSize: 13,
                  fontFamily: 'Poppins',
                  fontWeight: '700',
                  letterSpacing: 0.2,
                  ...hoverBtn
                }}
                onMouseEnter={onHoverUp}
                onMouseLeave={onHoverOut}
                onMouseDown={onMouseDownAnim}
              >
                Duvar Kağıdını Kaydet
              </button>
            </div>
          </div>
        )}

        {/* ─── 2. GÖRÜNÜM: DUVAR KAĞITLARIM (2 Sütunlu Liste, Onaylı Silme, İkonlu Butonlar) ─── */}
        {viewMode === 'quick' && (
          <div style={{
            flex: 1,
            padding: '14px 18px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            {/* Bildirim Mesajı */}
            {backupSuccessMsg && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid #22c55e',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12,
                color: '#15803d',
                fontWeight: '600'
              }}>
                ✓ {backupSuccessMsg}
              </div>
            )}

            {/* Üst Araç Çubuğu */}
            <div style={{
              background: '#fff0f3',
              border: '1.5px solid rgba(0,0,0,0.1)',
              borderRadius: 14,
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 13, fontWeight: '800', color: '#000', fontFamily: 'Poppins' }}>
                  Duvar Kağıtları ({savedThemes.length})
                </span>
                <span style={{ fontSize: 11, color: '#555', fontFamily: 'Poppins' }}>
                  Seçtiğinde gruptaki herkese anında yansır
                </span>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                {/* Yeni Çizim Butonu — Artı İkonuyla */}
                <button
                  onClick={() => { setEditingThemeId(null); setViewMode('draw'); }}
                  style={{
                    background: '#A2E5FF',
                    border: '1.5px solid #000',
                    borderRadius: 8,
                    padding: '5px 12px',
                    fontSize: 11,
                    fontFamily: 'Poppins',
                    fontWeight: '700',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    ...hoverBtn
                  }}
                  onMouseEnter={onHoverUp}
                  onMouseLeave={onHoverOut}
                  onMouseDown={onMouseDownAnim}
                >
                  <Plus size={13} strokeWidth={2.5} />
                  <span>Yeni Çiz</span>
                </button>

                {/* Yükle Butonu — Upload İkonuyla */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Yedekten Tema İçe Aktar"
                  style={{
                    background: 'white',
                    border: '1px solid rgba(0,0,0,0.2)',
                    borderRadius: 8,
                    padding: '5px 12px',
                    fontSize: 11,
                    fontFamily: 'Poppins',
                    fontWeight: '600',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    ...hoverBtn
                  }}
                  onMouseEnter={onHoverUp}
                  onMouseLeave={onHoverOut}
                  onMouseDown={onMouseDownAnim}
                >
                  <Upload size={12} />
                  <span>Yükle</span>
                </button>

                {/* Yedekle Butonu — Download İkonuyla */}
                <button
                  onClick={handleExportAllThemes}
                  title="Temaları Bilgisayara Yedekle"
                  style={{
                    background: 'white',
                    border: '1px solid rgba(0,0,0,0.2)',
                    borderRadius: 8,
                    padding: '5px 12px',
                    fontSize: 11,
                    fontFamily: 'Poppins',
                    fontWeight: '600',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    ...hoverBtn
                  }}
                  onMouseEnter={onHoverUp}
                  onMouseLeave={onHoverOut}
                  onMouseDown={onMouseDownAnim}
                >
                  <Download size={12} />
                  <span>Yedekle</span>
                </button>
              </div>
            </div>

            {/* Kayıtlı Temalar Listesi (Tek Satırda İki Kart, 2'den Fazlası Aşağı Kayar) */}
            {savedThemes.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                maxHeight: '300px',
                overflowY: 'auto',
                paddingRight: 4
              }}>
                {savedThemes.map(theme => {
                  const isSelected = currentTheme?.id === theme.id;
                  const isConfirmingDelete = deleteConfirmId === theme.id;

                  return (
                    <div
                      key={theme.id}
                      onClick={() => {
                        if (isConfirmingDelete) return;
                        onSelectTheme(theme);
                        onClose();
                      }}
                      style={{
                        background: '#f8b4c4',
                        border: isSelected ? '2.5px solid #2563eb' : '2px solid #000000',
                        borderRadius: 16,
                        padding: 10,
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        ...hoverBtn
                      }}
                      onMouseEnter={onHoverUp}
                      onMouseLeave={onHoverOut}
                    >
                      {/* Önizleme Resmi */}
                      <div style={{
                        width: '100%',
                        height: 90,
                        borderRadius: 10,
                        overflow: 'hidden',
                        border: '1.5px solid #000',
                        backgroundImage: theme.customWallpaper ? `url(${theme.customWallpaper})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: theme.userBubbleBg || '#fff'
                      }} />

                      {/* Bilgi & Butonlar (Silme Onaylı) */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 26 }}>
                        <span style={{ fontSize: 12, fontFamily: 'Poppins', fontWeight: '700', color: '#000' }}>
                          {theme.name}
                        </span>

                        {isConfirmingDelete ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#b91c1c' }}>Silinsin mi?</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCustomTheme(theme.id);
                                setSavedThemes(getSavedCustomThemes());
                                setDeleteConfirmId(null);
                              }}
                              style={{
                                background: '#ef4444',
                                color: 'white',
                                border: '1px solid #000',
                                borderRadius: 4,
                                padding: '1px 6px',
                                fontSize: 10,
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Evet
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(null);
                              }}
                              style={{
                                background: 'white',
                                border: '1px solid #000',
                                borderRadius: 4,
                                padding: '1px 6px',
                                fontSize: 10,
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              İptal
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              onClick={(e) => handleStartEditTheme(theme, e)}
                              title="Düzenle"
                              style={{
                                background: '#FCEDF1',
                                border: '1px solid #000',
                                borderRadius: 6,
                                padding: '2px 8px',
                                fontSize: 11,
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              ✏️ Düzenle
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(theme.id);
                              }}
                              title="Sil"
                              style={{
                                background: '#F19191',
                                border: '1px solid #000',
                                borderRadius: 6,
                                padding: '2px 8px',
                                fontSize: 11,
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              🗑️ Sil
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                background: '#fff0f3',
                borderRadius: 14,
                border: '1.5px dashed #000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10
              }}>
                <span style={{ fontSize: 32 }}>🎨</span>
                <div style={{ fontSize: 14, fontWeight: '700', color: '#000', fontFamily: 'Poppins' }}>
                  Henüz özel bir duvar kağıdı oluşturmadın
                </div>
                <button
                  onClick={() => { setEditingThemeId(null); setViewMode('draw'); }}
                  style={{
                    background: '#A2E5FF',
                    border: '1.5px solid #000',
                    borderRadius: 10,
                    padding: '6px 16px',
                    fontSize: 12,
                    fontFamily: 'Poppins',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  + İlk Duvar Kağıdını Çiz
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
