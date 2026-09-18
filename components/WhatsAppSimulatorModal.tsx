'use client';
import { ArrowLeft, Check, CheckCheck, MessageSquare, Phone, QrCode, Send, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { processInboundMessage, type BotReply } from '@/lib/bot-gateway';
import type { SupportedLanguage } from '@/lib/vernacular';

interface WhatsAppSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

const QUICK_TESTS = [
  'Forwarded: Congratulations! You won 250,000 NGN grant from Federal Gov. Click https://fed-empowerment.ng/claim and send OTP to verify.',
  'Urgent! Your M-Pesa account has been suspended. Dial *334*1# and enter 1234 to unlock.',
  'SOS',
  'pidgin',
  'swahili',
];

export function WhatsAppSimulatorModal({ isOpen, onClose }: WhatsAppSimulatorModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      sender: 'bot',
      text: '🛡️ *SHOMAR Protect WhatsApp Guard*\n\nWelcome! Forward any suspicious message, payment link, or vendor account here.\n\nType *SOS* for emergency bank freeze or type *PIDGIN*, *SWAHILI*, or *HAUSA* to change language.',
      time: '12:00',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('English');
  const [showQR, setShowQR] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  function getTimeString() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function handleSend(textToSend?: string) {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: getTimeString(),
      status: 'read',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const reply: BotReply = processInboundMessage({
        senderId: 'simulated-user',
        text,
        language: currentLang,
      });

      if (reply.language) {
        setCurrentLang(reply.language);
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: reply.message,
        time: getTimeString(),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  }

  const officialWhatsAppLink = 'https://wa.me/?text=Hi%20SHOMAR%20Protect,%20is%20this%20message%20a%20scam?';

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" style={{ zIndex: 1000 }}>
      <div className="modal-container" style={{ maxWidth: '520px', width: '100%', height: '85vh', maxHeight: '720px', background: '#e5ddd5', borderRadius: '18px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', border: '1px solid #cbd5e1' }}>
        
        {/* WhatsApp Header Bar */}
        <div style={{ background: '#075e54', color: '#ffffff', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 800 }}>
              🛡️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.98rem' }}>SHOMAR Protect Bot</span>
                <span style={{ background: '#128c7e', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}>✓</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#a7f3d0' }}>
                {isTyping ? 'analyzing security signals...' : 'Online · Official Pan-African Guard'}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setShowQR(!showQR)}
              title="Show QR Code to add on phone"
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', borderRadius: '8px', padding: '0.4rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700 }}
            >
              <QrCode size={16} />
              <span>{showQR ? 'Chat' : 'QR Link'}</span>
            </button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '0.35rem' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* QR Code Overlay (for desktop users scanning with phone camera) */}
        {showQR ? (
          <div style={{ flex: 1, background: '#ffffff', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ width: '160px', height: '160px', background: '#f8fafc', border: '3px solid #075e54', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              {/* Clean SVG Mock QR Code */}
              <svg width="120" height="120" viewBox="0 0 24 24" fill="#075e54">
                <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm13-2h3v2h-3v-2zm-5 0h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4 0h2v2h-2v-2zm-2 2h2v2h-2v-2z" />
              </svg>
            </div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Scan to Save on WhatsApp</h4>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#64748b', maxWidth: '280px' }}>
              Scan this code with your phone camera to instantly start checking forwarded scams on WhatsApp.
            </p>
            <a
              href={officialWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: '0.75rem 1.5rem', background: '#25d366', color: '#ffffff', fontWeight: 700, borderRadius: '10px', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>Open in WhatsApp</span>
              <MessageSquare size={16} />
            </a>
          </div>
        ) : (
          <>
            {/* Quick Test Chips */}
            <div style={{ background: '#f0f2f5', padding: '0.45rem 0.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '0.4rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Sparkles size={12} /> Test:
              </span>
              {QUICK_TESTS.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(t)}
                  style={{ fontSize: '0.72rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0.2rem 0.6rem', color: '#1e293b', cursor: 'pointer', fontWeight: 600 }}
                >
                  {t.length > 25 ? t.slice(0, 25) + '...' : t}
                </button>
              ))}
            </div>

            {/* Chat Message History */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '82%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: isUser ? '10px 0 10px 10px' : '0 10px 10px 10px',
                        background: isUser ? '#dcf8c6' : '#ffffff',
                        boxShadow: '0 1px 1px rgba(0,0,0,0.13)',
                        fontSize: '0.88rem',
                        lineHeight: '1.45',
                        color: '#111827',
                        position: 'relative',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {m.text}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem', marginTop: '0.2rem', fontSize: '0.68rem', color: '#64748b' }}>
                        <span>{m.time}</span>
                        {isUser && <CheckCheck size={14} color="#34b7f1" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ background: '#ffffff', padding: '0.5rem 0.85rem', borderRadius: '0 10px 10px 10px', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', boxShadow: '0 1px 1px rgba(0,0,0,0.13)' }}>
                    SHOMAR is checking security signals...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div style={{ background: '#f0f2f5', padding: '0.6rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                placeholder="Forward message, link, or type SOS..."
                style={{ flex: 1, padding: '0.65rem 0.95rem', borderRadius: '20px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', background: '#ffffff' }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: input.trim() ? '#075e54' : '#94a3b8',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: input.trim() ? 'pointer' : 'default',
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
