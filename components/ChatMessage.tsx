import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, AssistantMode } from '../types';
import ToneBadge from './ToneBadge';
import { PLATFORM_CONFIG } from '../constants';
import { Bot, User, Copy } from 'lucide-react';

interface Props {
  message: Message;
  mode: AssistantMode;
}

const ChatMessage: React.FC<Props> = ({ message, mode }) => {
  const isUser = message.role === 'user';
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  // Resolve Platform Icon if exists
  const platformConfig = message.platformSource ? PLATFORM_CONFIG[message.platformSource] : null;
  const PlatformIcon = platformConfig ? platformConfig.icon : null;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center relative
        ${isUser ? 'bg-primary-600' : 'bg-emerald-600'}`}>
        {isUser ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
        
        {/* Platform Badge overlay */}
        {PlatformIcon && (
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-dark-950 ${platformConfig?.bg}`}>
                <PlatformIcon size={10} className={platformConfig?.color} />
            </div>
        )}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        {platformConfig && (
            <span className="text-[10px] text-gray-500 mb-1 px-1 flex items-center gap-1 opacity-75">
                دریافتی از {platformConfig.label}
            </span>
        )}
        
        <div className={`relative px-5 py-3.5 rounded-2xl text-sm leading-7 shadow-lg
          ${isUser 
            ? 'bg-primary-600 text-white rounded-br-none' 
            : 'bg-dark-800 text-gray-100 rounded-bl-none border border-gray-700/50'
          }`}>
          
          <div className="markdown-content">
             <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {!isUser && (
            <button 
              onClick={handleCopy}
              className="absolute top-2 left-2 p-1 text-gray-400 hover:text-white transition-colors opacity-50 hover:opacity-100"
              title="کپی متن"
            >
              <Copy size={14} />
            </button>
          )}
        </div>

        {/* Tone Badge Logic: If this is an analysis result */}
        {mode === AssistantMode.TONE_ANALYSIS && !isUser && message.toneAnalysis && (
          <div className="w-full max-w-md">
            <ToneBadge data={message.toneAnalysis} />
          </div>
        )}
        
        <span className="text-xs text-gray-500 mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;