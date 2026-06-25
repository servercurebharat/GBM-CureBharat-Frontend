"use client";

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/auth';
import { X, Send, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  suggestions?: string[];
  type?: 'static' | 'dynamic' | 'hybrid';
  data?: any;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get user from Auth context
  const authContext = useAuth();
  const user = authContext?.user;

  useEffect(() => {
    if (!user?.mobile) return;

    const currentUser = user.mobile;
    const storedUser = localStorage.getItem('chatbot_user');

    // New login detected
    if (storedUser !== currentUser) {
      localStorage.removeItem('chatbot_messages');
      localStorage.setItem('chatbot_user', currentUser);

      const freshMessages: Message[] = [
        {
          id: '1',
          sender: 'bot',
          text: `Hi ${user.name || 'Partner'}! I am the CureBharat AI Assistant. How can I help you today?`,
          suggestions: [
            'What is my wallet balance?',
            'What is my KYC status?',
            'What is my role responsibility?'
          ]
        }
      ];

      setMessages(freshMessages);
      localStorage.setItem('chatbot_messages', JSON.stringify(freshMessages));
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize messages from localStorage or default
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatbot_messages');
      if (saved) {
        setMessages(JSON.parse(saved));
      } else if (user) {
        setMessages([
          {
            id: '1',
            sender: 'bot',
            text: `Hi ${user.name || 'Partner'}! I am the CureBharat AI Assistant. How can I help you today?`,
            suggestions: [
              'What is my wallet balance?',
              'What is my KYC status?',
              'What is my role responsibility?'
            ]
          }
        ]);
      }
    }
  }, [user]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatbot_messages', JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages]);

  // If user is not logged in, don't show the chatbot
  if (!user) return null;

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('token') || '';

      const response = await axios.post(
        `/api/chatbot/message`,
        { message: text },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.data.answer,
        suggestions: response.data.suggestions,
        type: response.data.type,
        data: response.data.data
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      const errorMsg = error.response?.data?.answer || 'Sorry, I encountered an error. Please try again.';
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'bot', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Inject keyframe CSS */}
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.93); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes chatSlideDown {
          from { opacity: 1; transform: translateY(0)    scale(1);    }
          to   { opacity: 0; transform: translateY(24px) scale(0.93); }
        }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0   rgba(73,210,181,0.55), 0 8px 30px rgba(73,210,181,0.4); }
          70%  { box-shadow: 0 0 0 14px rgba(73,210,181,0),   0 8px 30px rgba(73,210,181,0.4); }
          100% { box-shadow: 0 0 0 0   rgba(73,210,181,0),   0 8px 30px rgba(73,210,181,0.4); }
        }
        @keyframes spinIn {
          from { transform: rotate(-90deg) scale(0.5); opacity:0; }
          to   { transform: rotate(0deg)  scale(1);   opacity:1; }
        }
        @keyframes popIn {
          0%   { transform: scale(0.4) rotate(12deg); opacity:0; }
          70%  { transform: scale(1.15) rotate(-3deg); opacity:1; }
          100% { transform: scale(1)   rotate(0deg);  opacity:1; }
        }
        .chatbot-panel {
          animation: chatSlideUp 0.32s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .chatbot-btn-idle {
          animation: pulseRing 2.4s ease-in-out infinite;
        }
      `}</style>

      {isOpen && (
        <div
          className="chatbot-panel rounded-2xl shadow-2xl w-[370px] max-w-[90vw] h-[520px] max-h-[80vh] flex flex-col overflow-hidden mb-4 border"
          style={{
            background: 'rgba(21, 25, 33, 0.88)',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Header */}
          <div className="p-4 flex justify-between items-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1e1b6e 0%, #131241 100%)' }}>
            {/* Header glow */}
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-30 blur-2xl pointer-events-none"
              style={{ background: '#49D2B5' }} />
            
            <div className="flex items-center gap-2.5 relative z-10">
              <Image
                src="/Curebharat logo 22.png"
                alt="CureBharat Logo"
                width={130}
                height={36}
                className="object-contain"
                priority
              />
              <p className="text-[#49D2B5] text-[10px] font-bold">Secure Node Active</p>
            </div>
            <button 
              onClick={toggleChat} 
              className="text-white/60 hover:text-white hover:rotate-90 transition-all duration-300 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 relative z-20"
            >
              <X size={16} />
            </button>
            {/* Divider line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1.5px]"
              style={{ background: 'linear-gradient(90deg, transparent, #49D2B5, transparent)' }} />
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-[#0d0f14]/40">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}>
                <div 
                  className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-xs font-semibold leading-relaxed shadow-inner ${
                    msg.sender === 'user' 
                      ? 'text-white rounded-br-sm' 
                      : 'text-white/90 rounded-bl-sm border border-white/5'
                  }`}
                  style={msg.sender === 'user' ? {
                    background: 'linear-gradient(135deg, #49D2B5 0%, #1e1b6e 100%)',
                    boxShadow: '0 4px 12px rgba(73, 210, 181, 0.15)'
                  } : {
                    background: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div className="whitespace-pre-line">
                    {msg.text}
                  </div>
                  {msg.type === 'dynamic' && (
                    <div className="mt-1.5 text-[8px] text-[#49D2B5] font-black uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[#49D2B5] animate-ping" />
                      Live Feed
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                {msg.sender === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {msg.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(suggestion)}
                        className="text-[10px] font-bold px-3.5 py-2 rounded-full border transition-all duration-200"
                        style={{
                          background: 'rgba(73, 210, 181, 0.08)',
                          color: '#49D2B5',
                          borderColor: 'rgba(73, 210, 181, 0.25)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(73, 210, 181, 0.18)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(73, 210, 181, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(73, 210, 181, 0.08)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start animate-pulse">
                <div 
                  className="px-4 py-3 rounded-2xl rounded-bl-sm border border-white/5 flex items-center justify-center"
                  style={{ background: 'rgba(255, 255, 255, 0.08)' }}
                >
                  <Loader2 size={14} className="text-[#49D2B5] animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Panel */}
          <div className="p-3 bg-[#111420]/80 border-t border-white/10 relative z-10">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask CureBharat AI..."
                className="flex-1 bg-white/5 text-xs text-white placeholder-white/40 border border-white/15 rounded-full px-6 py-3 focus:outline-none focus:border-[#49D2B5]/50 focus:ring-2 focus:ring-[#49D2B5]/10 transition-all font-semibold"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-30 hover:scale-105 active:scale-[0.96] transition-all flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #49D2B5 0%, #1e1b6e 100%)',
                  boxShadow: '0 4px 10px rgba(73, 210, 181, 0.2)'
                }}
              >
                <Send size={14} className="ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Toggle Button */}
      <button
        onClick={toggleChat}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 overflow-hidden ${!isOpen ? 'chatbot-btn-idle hover:scale-110 active:scale-[0.95]' : 'hover:scale-105 active:scale-[0.95]'}`}
        style={{
          background: 'linear-gradient(135deg, #49D2B5 0%, #1e1b6e 100%)',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}
      >
        {isOpen
          ? <X size={22} style={{ animation: 'spinIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards' }} />
          : <Image src="/chatbot-icon.png" alt="CureBharat" width={36} height={36} className="object-contain p-1" style={{ animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards' }} />
        }
      </button>
    </div>
  );
}