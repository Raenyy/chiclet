import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Bot, Sparkles, Hash, Users, PhoneCall } from 'lucide-react';
import { generateAiResponse } from '../services/AiBotService';

export default function ChatView({ onStartVideoCall, onOpenStickerPicker }) {
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'Kullanici_x',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=User1',
      text: 'Oyun içi chat yerine bunu kullanmak çok pratik oldu valla 🔥',
      time: '19:50',
      isUser: false
    },
    {
      id: '2',
      sender: '@ai',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GameAI',
      text: 'Selam! @ai yazarak bana oyun hakkındaki sorularını sorabilirsin.',
      time: '19:51',
      isAi: true
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      sender: 'Sen',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MySelf',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true
    };

    setMessages(prev => [...prev, newMsg]);
    const currentInput = inputText;
    setInputText('');

    if (currentInput.toLowerCase().includes('@ai')) {
      setIsAiTyping(true);
      setTimeout(() => {
        const aiAnswer = generateAiResponse(currentInput.replace(/@ai/gi, ''));
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          sender: '@ai Asistan',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GameAI',
          text: aiAnswer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAi: true
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsAiTyping(false);
      }, 1200);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {}
      <div style={{
        padding: '10px 14px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Hash size={16} color="#3b82f6" />
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>genel-sohbet-odasi</span>
          <span style={{ fontSize: '10px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '1px 6px', borderRadius: '4px' }}>
            3 Çevrimiçi
          </span>
        </div>

        {}
        <button
          onClick={onStartVideoCall}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            border: 'none',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)'
          }}
        >
          <PhoneCall size={13} />
          Görüntülü Arama
        </button>
      </div>

      {/* Mesaj Listesi */}
      <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              gap: '10px',
              alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
              maxWidth: '85%'
            }}
          >
            {!msg.isUser && (
              <img
                src={msg.avatar}
                alt="avatar"
                style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}
              />
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', justifyContent: msg.isUser ? 'flex-end' : 'flex-start' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: msg.isAi ? '#60a5fa' : '#cbd5e1' }}>
                  {msg.sender}
                </span>
                {msg.isAi && (
                  <span style={{ fontSize: '9px', background: 'rgba(59, 130, 246, 0.3)', color: '#93c5fd', padding: '0 4px', borderRadius: '3px' }}>
                    BOT
                  </span>
                )}
                <span style={{ fontSize: '9px', color: '#64748b' }}>{msg.time}</span>
              </div>

              {/* Mesaj Baloncuğu */}
              <div style={{
                padding: '8px 12px',
                borderRadius: '12px',
                fontSize: '13px',
                lineHeight: '1.4',
                background: msg.isUser
                  ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                  : msg.isAi
                  ? 'rgba(30, 41, 59, 0.85)'
                  : 'rgba(255, 255, 255, 0.08)',
                color: '#f8fafc',
                border: msg.isAi ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                borderTopRightRadius: msg.isUser ? '2px' : '12px',
                borderTopLeftRadius: !msg.isUser ? '2px' : '12px'
              }}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {/* Yapay Zeka Yazıyor Efekti */}
        {isAiTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', fontSize: '11px' }}>
            <Bot size={14} className="animate-spin" />
            <span>@ai cevabını hazırlıyor...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Mesaj Yazma İnput Alanı */}
      <div style={{ padding: '10px 12px', background: 'rgba(0, 0, 0, 0.4)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Çıkartma/Emoji İkonu */}
        <button
          onClick={onOpenStickerPicker}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          title="Çıkartma / Emoji Gönder"
        >
          <Smile size={18} />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="@ai sorunu yaz veya arkadaşlarına mesaj at..."
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#fff',
            fontSize: '12px',
            outline: 'none'
          }}
        />

        <button
          onClick={handleSendMessage}
          style={{
            background: '#2563eb',
            border: 'none',
            color: '#fff',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}