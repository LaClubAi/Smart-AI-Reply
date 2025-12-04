import React, { useState, useRef, useEffect } from 'react';
import { AssistantMode, Message, Platform, ConnectedAccounts } from './types';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import IntegrationModal from './components/IntegrationModal';
import { streamResponse, analyzeTone } from './services/geminiService';
import { MODE_CONFIG, PLATFORM_CONFIG } from './constants';
import { Send, Menu, Sparkles, Trash2, Link, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AssistantMode>(AssistantMode.GENERAL_CHAT);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);
  
  // State to track linked accounts (Phone numbers/Emails)
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccounts>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mode change
  useEffect(() => {
    setMessages([]); // Clear chat on mode switch for cleaner context
    inputRef.current?.focus();
  }, [mode]);

  const handleSendMessage = async (overrideInput?: string, platformContext?: Platform) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
      platformSource: platformContext
    };

    setMessages(prev => [...prev, userMsg]);
    if (!overrideInput) setInput('');
    setIsLoading(true);

    try {
      // Special handling for Tone Analysis Mode
      if (mode === AssistantMode.TONE_ANALYSIS) {
        // First show a loading state message
        const botId = (Date.now() + 1).toString();
        const initialBotMsg: Message = {
          id: botId,
          role: 'model',
          content: 'در حال تحلیل متن شما...',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, initialBotMsg]);

        const analysis = await analyzeTone(userMsg.content);
        
        setMessages(prev => prev.map(msg => {
          if (msg.id === botId) {
            if (analysis) {
              return {
                ...msg,
                content: `تحلیل متن انجام شد. جزئیات زیر را بررسی کنید:`,
                toneAnalysis: analysis
              };
            } else {
              return { ...msg, content: 'متاسفانه در تحلیل متن مشکلی پیش آمد.' };
            }
          }
          return msg;
        }));
        setIsLoading(false);
        return;
      }

      // Standard Chat / Email / Messaging Mode (Streaming)
      const botMsgId = (Date.now() + 1).toString();
      
      // Initialize empty bot message
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        content: '',
        timestamp: Date.now()
      }]);

      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      // Pre-prompt logic for context awareness if platform is involved
      let finalPrompt = textToSend;
      if (platformContext) {
        // Updated to allow multi-language response
        finalPrompt = `I have received the following message on ${platformContext}. Please analyze it and draft a professional and appropriate response in the SAME LANGUAGE as the input message (Persian, English, or Russian) based on the current mode instructions. The response should be ready to send back to the user:\n\n"${textToSend}"`;
      }

      let accumulatedText = "";

      await streamResponse(mode, history, finalPrompt, (chunk) => {
        accumulatedText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId ? { ...msg, content: accumulatedText } : msg
        ));
      });

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportMessage = (content: string, platform: Platform, sender?: string) => {
    const contextPrefix = sender ? `پیام دریافتی از ${sender}:\n\n` : '';
    handleSendMessage(`${contextPrefix}${content}`, platform);
  };

  const handleConnectAccount = (platform: Platform, identifier: string) => {
    setConnectedAccounts(prev => ({
        ...prev,
        [platform]: identifier
    }));
  };

  const handleDisconnectAccount = (platform: Platform) => {
    setConnectedAccounts(prev => {
        const newState = { ...prev };
        delete newState[platform];
        return newState;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentIntegrations = MODE_CONFIG[mode].integrations;
  const showIntegrationBtn = currentIntegrations && currentIntegrations.length > 0;

  return (
    <div className="flex h-screen bg-dark-950 overflow-hidden text-right selection:bg-primary-500/30">
      <Sidebar 
        currentMode={mode} 
        setMode={setMode} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <IntegrationModal 
        isOpen={isIntegrationModalOpen}
        onClose={() => setIsIntegrationModalOpen(false)}
        onImport={handleImportMessage}
        activePlatformFilter={currentIntegrations}
        connectedAccounts={connectedAccounts}
        onConnect={handleConnectAccount}
        onDisconnect={handleDisconnectAccount}
      />

      <main className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <header className="h-16 border-b border-gray-800 bg-dark-900/80 backdrop-blur flex items-center justify-between px-4 z-10">
          <div className="flex items-center gap-3">
             <button 
               className="md:hidden p-2 text-gray-400 hover:text-white"
               onClick={() => setIsSidebarOpen(true)}
             >
                <Menu />
             </button>
             <div className="flex flex-col">
                <span className="font-bold text-gray-100 flex items-center gap-2">
                   {MODE_CONFIG[mode].label}
                   <span className="px-2 py-0.5 rounded-full bg-primary-900/50 border border-primary-500/20 text-[10px] text-primary-300">
                      AI Powered
                   </span>
                </span>
                <span className="text-xs text-gray-500 hidden sm:block">
                   {MODE_CONFIG[mode].description}
                </span>
             </div>
          </div>

          <div className="flex items-center gap-2">
             {/* Integration Button */}
             {showIntegrationBtn && (
                <button
                    onClick={() => setIsIntegrationModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-dark-800 hover:bg-dark-700 border border-gray-700 rounded-lg text-xs font-medium text-gray-300 transition-colors mr-2 animate-in fade-in"
                >
                   <Link size={14} />
                   <span className="hidden sm:inline">مدیریت پیام‌ها</span>
                   <div className="flex -space-x-1 space-x-reverse">
                       {currentIntegrations.map(p => {
                           const Icon = PLATFORM_CONFIG[p].icon;
                           const isConnected = !!connectedAccounts[p];
                           return (
                               <div key={p} className={`w-5 h-5 rounded-full flex items-center justify-center border border-dark-800 transition-all duration-300 ${isConnected ? PLATFORM_CONFIG[p].bg : 'bg-gray-800'}`}>
                                   <Icon size={10} className={isConnected ? PLATFORM_CONFIG[p].color : 'text-gray-500'} />
                               </div>
                           )
                       })}
                   </div>
                </button>
             )}
          
            <button 
                onClick={() => setMessages([])} 
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="پاک کردن گفتگو"
            >
                <Trash2 size={18} />
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
               <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Sparkles size={40} className="text-primary-400" />
               </div>
               <h3 className="text-xl font-bold mb-2 text-gray-200">چطور می‌توانم کمک کنم؟</h3>
               <p className="max-w-md text-sm text-gray-400">
                 متن ایمیل، پیام واتساپ یا هر موضوعی که می‌خواهید در مورد آن صحبت کنید را بنویسید. 
                 پشتیبانی کامل از زبان‌های فارسی، انگلیسی و روسی.
               </p>
               {showIntegrationBtn && (
                   <button 
                     onClick={() => setIsIntegrationModalOpen(true)}
                     className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-primary-600/20 text-primary-300 rounded-xl text-sm border border-primary-500/30 hover:bg-primary-600/30 transition-all"
                   >
                     <Settings size={16} />
                     اتصال به پیام‌رسان‌ها
                   </button>
               )}
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} mode={mode} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-dark-900 border-t border-gray-800">
          <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-dark-800 p-2 rounded-2xl border border-gray-700/50 focus-within:border-primary-500/50 focus-within:ring-1 focus-within:ring-primary-500/50 transition-all shadow-lg">
            
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={mode === AssistantMode.TONE_ANALYSIS ? "متنی که می‌خواهید تحلیل شود را وارد کنید..." : "پیام خود را بنویسید (FA, EN, RU)..."}
              className="w-full bg-transparent text-gray-100 placeholder-gray-500 resize-none max-h-40 min-h-[50px] p-3 focus:outline-none text-sm leading-6"
              rows={1}
            />
            
            <button 
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              className={`p-3 rounded-xl flex items-center justify-center transition-all duration-200
                ${input.trim() && !isLoading
                  ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={20} className={input.trim() ? 'ml-0.5' : ''} /> 
              )}
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-600">
              دستیار هوشمند ممکن است اشتباه کند. نسخه دمو (بدون اتصال مستقیم به API).
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;