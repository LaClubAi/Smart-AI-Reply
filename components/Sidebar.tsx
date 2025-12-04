import React from 'react';
import { AssistantMode } from '../types';
import { MODE_CONFIG } from '../constants';
import { Cpu, Globe } from 'lucide-react';

interface Props {
  currentMode: AssistantMode;
  setMode: (mode: AssistantMode) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

const Sidebar: React.FC<Props> = ({ currentMode, setMode, isOpen, setIsOpen }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div className={`fixed inset-y-0 right-0 z-30 w-72 bg-dark-900 border-l border-gray-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6 border-b border-gray-800/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Cpu className="text-white" size={24} />
            </div>
            <div>
                <h1 className="font-bold text-xl tracking-tight text-white">Dastyar AI</h1>
                <p className="text-xs text-primary-400 flex items-center gap-1">
                   <Globe size={10} />
                   <span>فارسی • English • Русский</span>
                </p>
            </div>
        </div>

        <div className="p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-500 mb-3 px-2 uppercase tracking-wider">حالت‌های گفتگو</div>
          {(Object.keys(MODE_CONFIG) as AssistantMode[]).map((mode) => {
            const config = MODE_CONFIG[mode];
            const Icon = config.icon;
            const isActive = currentMode === mode;

            return (
              <button
                key={mode}
                onClick={() => {
                  setMode(mode);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group text-right
                  ${isActive 
                    ? 'bg-primary-600/10 border border-primary-500/50 text-primary-400' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-100 border border-transparent'
                  }`}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-primary-500 text-white' : 'bg-dark-800 group-hover:bg-dark-800'}`}>
                    <Icon size={18} />
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : ''}`}>
                    {config.label}
                  </span>
                  <span className="text-[10px] opacity-70 truncate max-w-[140px]">
                    {config.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
             <div className="bg-dark-800 rounded-lg p-3 border border-gray-700/50">
                <p className="text-xs text-gray-400 text-center">
                    طراحی شده با ❤️ توسط React & Gemini
                </p>
             </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;