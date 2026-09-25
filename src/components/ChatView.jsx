import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, UserPlus, Sticker, Mic, PhoneCall, Video, Search, LogOut } from 'lucide-react';
import { askRealAi } from '../services/AiBotService';
import { subscribeToThemeChanges } from '../services/ThemeService';
import { p2pService } from '../services/P2PService';
import InviteModal from './InviteModal.jsx';

const EMOJI_CATEGORIES = [
  { id: 'smileys', name: '😀 Duygular', icon: '😀', emojis: ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','💩','🤡','👹','👺','👻','👽','👾','🤖'] },
  { id: 'gestures', name: '👍 El & Beden', icon: '👍', emojis: ['👋','🤚','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','👀','👁️','👅','👄'] },
  { id: 'animals', name: '🐶 Hayvanlar', icon: '🐶', emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐓','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐍','🦎','🐙','🐟','🐬','🐳','🐋','🐒','🐑','🐏','🦌','🐕','🐈','🌴','🌳','🌸','🌺','🌹','🌷','🌻','⭐','🌟','✨','⚡','🔥','🌈','☀️','❄️','🌊'] },
  { id: 'food', name: '🍕 Yiyecek', icon: '🍕', emojis: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌽','🥕','🧄','🧅','🥔','🍠','🥐','🥖','🍞','🥨','🥯','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','☕','🫖','🍵','🧃','🥤','🧋','🫙','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧊'] },
  { id: 'gaming', name: '🎮 Oyun', icon: '🎮', emojis: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🨀','🏓','🏸','🏒','🏑','🥍','🏏','🨃','🥅','⛳','🨁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🏆','🥇','🥈','🥉','🏅','🎫','🎪','🤹','🎭','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🎷','🎺','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🕹️','🎰','🧩'] },
  { id: 'hearts', name: '❤️ Kalpler', icon: '❤️', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','✔️','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','⚠️','🚸','🔔','♻️','✅','❎','🌐','💠','🌀','💤','🏧','♿','🅿️','🛂','🛃','🛄','🛅','🚹','🚺','🚼','⚧️','🚻','🚮','🎦','📶','🔴','🟠','🟡','🟢','🔵','🟣','🟤','⚫','⚪','🟥','🟧','🟨','🟩','🟦','🟪','🟫','⬛','⬜','◼️','◻️','◾','◽','▪️','▫️','🔶','🔷','🔸','🔹','🔺','🔻','🔘','🔳','🔲'] }
];

const DEFAULT_STICKERS = [
  { id: 's1', emoji: '🐸', label: 'Pepe' },
  { id: 's2', emoji: '🦆', label: 'Duck' },
  { id: 's3', emoji: '🐱', label: 'Kedi' },
  { id: 's4', emoji: '🌚', label: 'Moon' },
  { id: 's5', emoji: '💅', label: 'Sassy' },
  { id: 's6', emoji: '🧠', label: 'Big Brain' },
  { id: 's7', emoji: '🤡', label: 'Clown' },
  { id: 's8', emoji: '👺', label: 'Goblin' },
];

export default function ChatView({
  user, isMiniMode, currentTheme, opacity = 0.88,
  isVoiceConnected, onJoinVoiceCall, onRegisterSendVoiceInvite,
  isVideoCallOpen, onJoinVideoCall, onRegisterSendVideoInvite,
  onNewMessageArrival
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState('smileys');
  const [emojiSearch, setEmojiSearch] = useState('');
  const [showStickerPanel, setShowStickerPanel] = useState(false);
  const [isPushToTalkActive, setIsPushToTalkActive] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const emojiPanelRef = useRef(null);
  const stickerPanelRef = useRef(null);
  const emojiBtnRef = useRef(null);
  const stickerBtnRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isAiTyping]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showEmojiPanel && emojiPanelRef.current && !emojiPanelRef.current.contains(e.target) && !emojiBtnRef.current?.contains(e.target)) setShowEmojiPanel(false);
      if (showStickerPanel && stickerPanelRef.current && !stickerPanelRef.current.contains(e.target) && !stickerBtnRef.current?.contains(e.target)) setShowStickerPanel(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPanel, showStickerPanel]);

  const [connectedPeerCount, setConnectedPeerCount] = useState(() => p2pService.getConnectedPeers().length);

  const handleLeaveChatRoom = () => {
    p2pService.disconnectAll();
    setConnectedPeerCount(0);
    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'system', sender: user || 'Sen', text: 'sohbetten ayrildın.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    if (onNewMessageArrival) onNewMessageArrival();
  };

  useEffect(() => {
    p2pService.init(user);
    const unsubMsg = p2pService.onMessage((data) => {
      if (data?.type === 'CHAT_MESSAGE') { setMessages(prev => [...prev, { id: data.id || Date.now().toString(), sender: data.sender || 'Arkadaş', text: data.text, type: 'text', time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isUser: false }]); if (onNewMessageArrival) onNewMessageArrival(); }
      else if (data?.type === 'STICKER_MESSAGE') { setMessages(prev => [...prev, { id: data.id || Date.now().toString(), sender: data.sender || 'Arkadaş', type: 'sticker', stickerData: data.stickerData, time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isUser: false }]); if (onNewMessageArrival) onNewMessageArrival(); }
      else if (data?.type === 'LEAVE_CHAT') { setConnectedPeerCount(p2pService.getConnectedPeers().length); setMessages(prev => [...prev, { id: Date.now().toString(), type: 'system', sender: data.username || 'Arkadaş', text: 'sohbetten ayrıldı.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]); if (onNewMessageArrival) onNewMessageArrival(); }
      else if (data?.type === 'VOICE_INVITE') { setMessages(prev => [...prev, { id: data.id || Date.now().toString(), sender: data.sender || 'Arkadaş', type: 'voice_invite', text: '@' + (data.sender || 'Arkadaş') + ' sesli sohbete katılmanı bekliyor! 🎙️', time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isVoiceInvite: true }]); if (onNewMessageArrival) onNewMessageArrival(); }
      else if (data?.type === 'VIDEO_INVITE') { setMessages(prev => [...prev, { id: data.id || Date.now().toString(), sender: data.sender || 'Arkadaş', type: 'video_invite', text: '@' + (data.sender || 'Arkadaş') + ' görüntülü sohbete katılmanı bekliyor! 📹', time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isVideoInvite: true }]); if (onNewMessageArrival) onNewMessageArrival(); }
    });
    const unsubJoin = p2pService.onPeerJoin((peerId, remoteUser) => { setConnectedPeerCount(p2pService.getConnectedPeers().length); setMessages(prev => [...prev, { id: Date.now().toString(), type: 'system', sender: remoteUser || 'Arkadaş', text: 'odaya bağlandı! 🎉', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]); if (onNewMessageArrival) onNewMessageArrival(); });
    const unsubLeave = p2pService.onPeerLeave((peerId, remoteUser) => { setConnectedPeerCount(p2pService.getConnectedPeers().length); setMessages(prev => [...prev, { id: Date.now().toString(), type: 'system', sender: remoteUser || 'Arkadaş', text: 'sohbetten ayrıldı.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]); if (onNewMessageArrival) onNewMessageArrival(); });
    return () => { unsubMsg(); unsubJoin(); unsubLeave(); };
  }, [user, onNewMessageArrival]);

  useEffect(() => {
    if (onRegisterSendVoiceInvite) {
      onRegisterSendVoiceInvite(() => {
        const msgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const payload = { id: Date.now().toString(), sender: user || 'Sen', type: 'voice_invite', text: '@' + (user || 'Sen') + ' sesli sohbete katılmanı bekliyor! 🎙️', time: msgTime, isVoiceInvite: true };
        setMessages(prev => [...prev, payload]); p2pService.broadcast(payload); if (onNewMessageArrival) onNewMessageArrival();
      });
    }
  }, [user, onRegisterSendVoiceInvite, onNewMessageArrival]);

  useEffect(() => {
    if (onRegisterSendVideoInvite) {
      onRegisterSendVideoInvite(() => {
        const msgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const payload = { id: Date.now().toString(), sender: user || 'Sen', type: 'video_invite', text: '@' + (user || 'Sen') + ' görüntülü sohbete katılmanı bekliyor! 📹', time: msgTime, isVideoInvite: true };
        setMessages(prev => [...prev, payload]); p2pService.broadcast(payload); if (onNewMessageArrival) onNewMessageArrival();
      });
    }
  }, [user, onRegisterSendVideoInvite, onNewMessageArrival]);

  const prevThemeIdRef = useRef(currentTheme?.id);
  useEffect(() => {
    if (prevThemeIdRef.current && prevThemeIdRef.current !== currentTheme?.id) {
      setMessages(prev => [...prev, { id: Date.now().toString(), type: 'system', sender: user || 'Sen', text: 'duvar kağıdını değiştirdi', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      if (onNewMessageArrival) onNewMessageArrival();
    }
    prevThemeIdRef.current = currentTheme?.id;
  }, [currentTheme?.id, user, onNewMessageArrival]);

  useEffect(() => {
    const unsubscribe = subscribeToThemeChanges((newTheme, byUser) => {
      if (byUser && byUser !== user) { setMessages(prev => [...prev, { id: Date.now().toString(), type: 'system', sender: byUser, text: 'duvar kağıdını değiştirdi', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]); if (onNewMessageArrival) onNewMessageArrival(); }
    });
    return unsubscribe;
  }, [user, onNewMessageArrival]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement === inputRef.current) return;
      if (e.key === '/') { e.preventDefault(); inputRef.current?.focus(); }
      if (e.altKey && (e.key === 'e' || e.key === 'E')) { e.preventDefault(); setShowEmojiPanel(prev => !prev); setShowStickerPanel(false); }
      if (e.altKey && (e.key === 's' || e.key === 'S')) { e.preventDefault(); setShowStickerPanel(prev => !prev); setShowEmojiPanel(false); }
      if ((e.key === 'v' || e.key === 'V') && !isPushToTalkActive) setIsPushToTalkActive(true);
    };
    const handleKeyUp = (e) => { if (e.key === 'v' || e.key === 'V') setIsPushToTalkActive(false); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [isPushToTalkActive]);

  const handleEmojiClick = (emoji) => { setInputText(prev => prev + emoji); inputRef.current?.focus(); };

  const sendMessage = async (text, type = 'text', stickerData = null) => {
    if (!text.trim() && !stickerData) return;
    const msgId = Date.now().toString();
    const msgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { id: msgId, sender: user || 'Sen', text, type, stickerData, time: msgTime, isUser: true };
    setMessages(prev => [...prev, newMsg]);
    setInputText(''); setShowEmojiPanel(false); setShowStickerPanel(false);
    if (onNewMessageArrival) onNewMessageArrival();
    if (type === 'sticker') { p2pService.broadcast({ type: 'STICKER_MESSAGE', id: msgId, sender: user || 'Sen', stickerData, time: msgTime }); }
    else { p2pService.broadcast({ type: 'CHAT_MESSAGE', id: msgId, sender: user || 'Sen', text, time: msgTime }); }
    if (text.toLowerCase().includes('@ai')) {
      setIsAiTyping(true);
      const prompt = text.replace(/@ai/gi, '').trim() || text;
      const aiResponse = await askRealAi(prompt);
      const aiMsg = { id: (Date.now() + 1).toString(), sender: '@ai', text: aiResponse, type: 'text', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isAi: true };
      setMessages(prev => [...prev, aiMsg]);
      p2pService.broadcast({ type: 'CHAT_MESSAGE', ...aiMsg });
      setIsAiTyping(false);
      if (onNewMessageArrival) onNewMessageArrival();
    }
  };

  const displayedMessages = messages;
  const currentCategory = EMOJI_CATEGORIES.find(c => c.id === activeEmojiTab) || EMOJI_CATEGORIES[0];
  const displayedEmojis = emojiSearch.trim() ? EMOJI_CATEGORIES.flatMap(c => c.emojis) : currentCategory.emojis;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', minHeight: 0 }}>
      {!isMiniMode && !isVoiceConnected && (
        <div style={{ padding: '8px 14px 4px 14px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#333333' }}>@{user || 'Kullaniciadin'}</span>
            {isPushToTalkActive && (
              <span style={{ fontSize: '10px', background: '#9de3fe', color: '#000', padding: '2px 7px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '3px', border: '1px solid #000' }}>
                <Mic size={10} /> Konuşuluyor...
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              style={{
                background: '#e6d3d9',
                border: 'none',
                color: '#444444',
                borderRadius: '12px',
                padding: '4px 14px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontFamily: 'inherit'
              }}
            >
              <UserPlus size={11} />
              {connectedPeerCount > 0 ? 'Oda (' + (connectedPeerCount + 1) + ')' : 'Davet Et'}
            </button>
            {connectedPeerCount > 0 && (
              <button
                onClick={handleLeaveChatRoom}
                title="Odadan Ayrıl"
                style={{
                  background: '#fca5a5',
                  border: '1px solid #000',
                  color: '#000',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'inherit'
                }}
              >
                <LogOut size={11} color="#000" /> Ayrıl
              </button>
            )}
          </div>
        </div>
      )}

      <div className="custom-scrollbar" style={{
        flex: 1, padding: isMiniMode ? '6px 8px' : '10px 12px', overflowY: 'auto', overflowX: 'hidden',
        display: 'flex', flexDirection: 'column', gap: '7px', minHeight: 0,
        backgroundColor: 'transparent',
        position: 'relative'
      }}>
        {currentTheme?.customWallpaper && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${currentTheme.customWallpaper})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: opacity, pointerEvents: 'none', zIndex: 0
          }} />
        )}
        <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }} />
        {!isMiniMode && messages.length === 0 && (
          <div style={{ flex: 1, position: 'relative', zIndex: 1 }} />
        )}

        {displayedMessages.map((msg) => {
          if (msg.type === 'system') {
            return (
              <div key={msg.id} style={{ alignSelf: 'center', margin: '4px 0', padding: '4px 12px', borderRadius: '14px', background: '#fff0f3', border: '1px solid #000', color: '#000', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px', userSelect: 'none', position: 'relative', zIndex: 1 }}>
                <span style={{ fontSize: '11px' }}>🎨</span>
                <span style={{ color: '#000', fontWeight: '700' }}>@{msg.sender}</span>
                <span>{msg.text}</span>
              </div>
            );
          }
          const isInviteCard = msg.isVoiceInvite || msg.isVideoInvite || msg.type === 'voice_invite' || msg.type === 'video_invite';
          const isCardActive = msg.type === 'video_invite' ? isVideoCallOpen : isVoiceConnected;
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignSelf: isInviteCard ? 'center' : msg.isUser ? 'flex-end' : 'flex-start', maxWidth: isInviteCard ? '95%' : '85%', width: isInviteCard ? '95%' : 'auto', position: 'relative', zIndex: 1 }}>
              {!isMiniMode && !isInviteCard && (
                <span style={{ fontSize: '10px', fontWeight: '700', marginBottom: '3px', color: msg.isAi ? '#2563eb' : '#444', textAlign: msg.isUser ? 'right' : 'left', paddingLeft: msg.isUser ? 0 : '4px', paddingRight: msg.isUser ? '4px' : 0 }}>
                  {msg.isAi ? '🤖 @ai' : msg.sender} · {msg.time}
                </span>
              )}
              {isInviteCard ? (
                <div style={{ background: isCardActive ? '#9de3fe' : '#ffffff', border: '2px solid #000', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', boxShadow: '0 3px 0 #000' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1.5px solid #000', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {msg.type === 'video_invite' ? <Video size={15} color="#000" /> : <PhoneCall size={15} color="#000" />}
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#000' }}>{msg.text}</div>
                      <div style={{ fontSize: '10px', color: '#333' }}>
                        {msg.type === 'video_invite' ? (isCardActive ? 'Görüntülü arama odası açık' : 'Görüntülü arama sona erdi') : (isCardActive ? 'Sesli konuşma odası açık' : 'Sesli arama sona erdi')}
                      </div>
                    </div>
                  </div>
                  {isCardActive ? (
                    <span style={{ background: '#bbf7d0', border: '1.5px solid #000', borderRadius: '8px', color: '#000', padding: '4px 8px', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {msg.type === 'video_invite' ? <Video size={11} /> : <PhoneCall size={11} />} Katıldın ✓
                    </span>
                  ) : (
                    <button onClick={msg.type === 'video_invite' ? onJoinVideoCall : onJoinVoiceCall} className="chiclet-btn-primary" style={{ padding: '5px 12px', fontSize: '11px', fontWeight: '700' }}>
                      {msg.type === 'video_invite' ? 'Görüntülüye Katıl' : 'Sese Katıl'}
                    </button>
                  )}
                </div>
              ) : msg.type === 'sticker' ? (
                <div style={{ fontSize: '40px', lineHeight: 1, textAlign: msg.isUser ? 'right' : 'left' }}>{msg.stickerData?.emoji}</div>
              ) : (
                <div style={{
                  background: msg.isUser ? (currentTheme?.userBubbleBg || '#9de3fe') : (currentTheme?.aiBubbleBg || '#ffffff'),
                  color: '#000000',
                  fontWeight: '600',
                  border: '2px solid #000000',
                  borderRadius: '12px',
                  padding: isMiniMode ? '5px 8px' : '7px 12px',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  boxShadow: '0 2px 0 rgba(0,0,0,0.1)'
                }}>
                  {msg.text}
                </div>
              )}
            </div>
          );
        })}
        {isAiTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ab0e0', fontSize: '11px' }}>
            <Bot size={12} /><span>@ai yazıyor...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showEmojiPanel && (
        <div ref={emojiPanelRef} style={{ position: 'absolute', bottom: isMiniMode ? '48px' : '60px', left: '8px', right: isMiniMode ? '8px' : 'auto', width: isMiniMode ? 'auto' : '280px', maxHeight: isMiniMode ? '145px' : 'min(310px,calc(100% - 75px))', background: '#fff0f3', border: '2px solid #000', borderRadius: '14px', padding: isMiniMode ? '6px 8px' : '10px', zIndex: 60, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', padding: isMiniMode ? '3px 6px' : '5px 8px', borderRadius: '8px', border: '1.5px solid #000' }}>
            <Search size={isMiniMode ? 10 : 12} color="#000" />
            <input type="text" value={emojiSearch} onChange={(e) => setEmojiSearch(e.target.value)} placeholder="Emoji ara..." style={{ background: 'transparent', border: 'none', color: '#000', fontSize: isMiniMode ? '10px' : '11px', fontWeight: '600', outline: 'none', width: '100%', fontFamily: 'inherit' }} />
          </div>
          {!emojiSearch && (
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid #000', paddingBottom: isMiniMode ? '3px' : '6px' }}>
              {EMOJI_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setActiveEmojiTab(cat.id)} title={cat.name} style={{ background: activeEmojiTab === cat.id ? '#fecdd6' : 'transparent', border: activeEmojiTab === cat.id ? '1px solid #000' : 'none', borderRadius: '6px', padding: isMiniMode ? '2px 4px' : '3px 5px', fontSize: isMiniMode ? '13px' : '15px', cursor: 'pointer' }}>
                  {cat.icon}
                </button>
              ))}
            </div>
          )}
          <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: isMiniMode ? 'repeat(6,1fr)' : 'repeat(7,1fr)', gap: '3px', maxHeight: isMiniMode ? '85px' : '190px' }}>
            {displayedEmojis.map((emoji, idx) => (
              <button key={idx} onClick={() => handleEmojiClick(emoji)} style={{ background: 'transparent', border: 'none', fontSize: isMiniMode ? '16px' : '19px', cursor: 'pointer', padding: isMiniMode ? '2px' : '3px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fecdd6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >{emoji}</button>
            ))}
          </div>
        </div>
      )}

      {showStickerPanel && (
        <div ref={stickerPanelRef} style={{ position: 'absolute', bottom: isMiniMode ? '48px' : '60px', left: isMiniMode ? '8px' : '40px', right: isMiniMode ? '8px' : 'auto', width: isMiniMode ? 'auto' : '200px', maxHeight: isMiniMode ? '135px' : '220px', background: '#fff0f3', border: '2px solid #000', borderRadius: '14px', padding: isMiniMode ? '6px 8px' : '10px', zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflowY: 'auto' }}>
          <div style={{ fontSize: '10px', color: '#000', marginBottom: '6px', fontWeight: '800', textTransform: 'uppercase' }}>Çıkartmalar</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {DEFAULT_STICKERS.map(s => (
              <button key={s.id} onClick={() => sendMessage(s.emoji, 'sticker', { emoji: s.emoji, label: s.label })} title={s.label} style={{ background: '#ffffff', border: '1.5px solid #000', borderRadius: '8px', padding: isMiniMode ? '3px' : '5px', cursor: 'pointer', fontSize: isMiniMode ? '18px' : '22px' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fecdd6'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
              >{s.emoji}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{
        margin: isMiniMode ? '2px 4px 4px 4px' : '0 10px 8px 10px',
        padding: '5px 7px',
        background: '#FFD2D3',
        border: '1px solid #000',
        boxShadow: '2px 4px 4px 1px rgba(0,0,0,0.40)',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexShrink: 0
      }}>
        <button
          ref={emojiBtnRef}
          onClick={() => { setShowEmojiPanel(!showEmojiPanel); setShowStickerPanel(false); }}
          title="Emojiler"
          style={{ width: 26, height: 26, background: '#FCEDF1', border: '1px black solid', boxShadow: '1px 1px 4px rgba(0,0,0,0.25)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, padding: 0, transition: 'transform 0.1s ease, box-shadow 0.1s ease' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '1px 3px 6px rgba(0,0,0,0.20)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '1px 1px 4px rgba(0,0,0,0.25)'; }}
          onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.boxShadow = '0px 0px 2px rgba(0,0,0,0.15)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '1px 3px 6px rgba(0,0,0,0.20)'; }}
        >
          😄
        </button>
        <button
          ref={stickerBtnRef}
          onClick={() => { setShowStickerPanel(!showStickerPanel); setShowEmojiPanel(false); }}
          title="Çıkartma"
          style={{ width: 26, height: 26, background: '#FCEDF1', border: '1px black solid', boxShadow: '1px 1px 4px rgba(0,0,0,0.25)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, transition: 'transform 0.1s ease, box-shadow 0.1s ease' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '1px 3px 6px rgba(0,0,0,0.20)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '1px 1px 4px rgba(0,0,0,0.25)'; }}
          onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.boxShadow = '0px 0px 2px rgba(0,0,0,0.15)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '1px 3px 6px rgba(0,0,0,0.20)'; }}
        >
          <Sticker size={14} color="#000" />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
          placeholder="Mesaj yaz veya / bas"
          style={{
            flex: 1, height: 29, padding: '0 10px',
            background: '#FCEDF1', border: 'none', borderRadius: 8,
            color: 'rgba(0,0,0,0.70)', fontSize: 12, fontFamily: 'Poppins', fontWeight: '500',
            outline: 'none', minWidth: 0
          }}
        />
        <button
          onClick={() => sendMessage(inputText)}
          title="Gönder"
          style={{ width: 26, height: 26, background: '#A2E5FF', border: '1px black solid', boxShadow: '1px 1px 4px rgba(0,0,0,0.25)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, transition: 'transform 0.1s ease, box-shadow 0.1s ease' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '1px 3px 6px rgba(0,0,0,0.20)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '1px 1px 4px rgba(0,0,0,0.25)'; }}
          onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.boxShadow = '0px 0px 2px rgba(0,0,0,0.15)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '1px 3px 6px rgba(0,0,0,0.20)'; }}
        >
          <Send size={14} color="#000" />
        </button>
      </div>

      {isInviteModalOpen && (<InviteModal user={user} onClose={() => setIsInviteModalOpen(false)} />)}
    </div>
  );
}
