import React, { useState, useEffect } from 'react';
import { Platform, ConnectedAccounts } from '../types';
import { PLATFORM_CONFIG, MOCK_INBOX_DATA } from '../constants';
import { X, Download, MessageSquarePlus, Wifi, CheckCircle2, ArrowRight, Loader2, Unplug, Globe } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (content: string, platform: Platform, sender?: string) => void;
  activePlatformFilter: Platform[];
  connectedAccounts: ConnectedAccounts;
  onConnect: (platform: Platform, identifier: string) => void;
  onDisconnect: (platform: Platform) => void;
}

const COUNTRY_CODES = [
  { code: '+98', country: 'ایران', flag: '🇮🇷' },
  { code: '+1', country: 'آمریکا/کانادا', flag: '🇺🇸' },
  { code: '+44', country: 'انگلستان', flag: '🇬🇧' },
  { code: '+49', country: 'آلمان', flag: '🇩🇪' },
  { code: '+90', country: 'ترکیه', flag: '🇹🇷' },
  { code: '+971', country: 'امارات', flag: '🇦🇪' },
  { code: '+93', country: 'افغانستان', flag: '🇦🇫' },
  { code: '+33', country: 'فرانسه', flag: '🇫🇷' },
  { code: '+86', country: 'چین', flag: '🇨🇳' },
  { code: '+7', country: 'روسیه', flag: '🇷🇺' },
  { code: '+964', country: 'عراق', flag: '🇮🇶' },
];

const IntegrationModal: React.FC<Props> = ({ 
    isOpen, onClose, onImport, activePlatformFilter, 
    connectedAccounts, onConnect, onDisconnect 
}) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'manual'>('inbox');
  const [manualText, setManualText] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(activePlatformFilter[0] || 'whatsapp');
  
  // Local state for connection form
  const [connectingPlatform, setConnectingPlatform] = useState<Platform | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [countryCode, setCountryCode] = useState('+98');
  const [isSimulatingLink, setIsSimulatingLink] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
        setConnectingPlatform(null);
        setInputValue('');
        setIsScanning(false);
        setCountryCode('+98');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter messages based on connected platforms and active mode
  const availableMessages = MOCK_INBOX_DATA.filter(msg => 
    activePlatformFilter.includes(msg.platform) && connectedAccounts[msg.platform]
  );

  const handleManualImport = () => {
    if (!manualText.trim()) return;
    onImport(manualText, selectedPlatform, 'کاربر دستی');
    setManualText('');
    onClose();
  };

  const startConnectionFlow = (platform: Platform) => {
    setConnectingPlatform(platform);
    setInputValue('');
  };

  const confirmConnection = () => {
    if (!connectingPlatform || !inputValue) return;
    
    setIsSimulatingLink(true);
    // Simulate API call delay
    setTimeout(() => {
        const finalIdentifier = connectingPlatform === 'email' 
            ? inputValue 
            : `${countryCode} ${inputValue}`;
            
        onConnect(connectingPlatform, finalIdentifier);
        setIsSimulatingLink(false);
        setConnectingPlatform(null);
        
        // Start "Scanning" effect after connection
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 2000);
    }, 2000);
  };

  const renderConnectionForm = () => {
    if (!connectingPlatform) return null;
    const config = PLATFORM_CONFIG[connectingPlatform];
    const Icon = config.icon;
    const isEmail = connectingPlatform === 'email';

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-dark-800/50 rounded-2xl border border-gray-700 animate-in fade-in slide-in-from-bottom-4">
            <div className={`p-4 rounded-full mb-4 ${config.bg} ${config.color} shadow-lg`}>
                <Icon size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-100 mb-2">اتصال به {config.label}</h3>
            <p className="text-sm text-gray-400 text-center mb-6 max-w-xs">
                {isEmail 
                    ? "برای همگام‌سازی ایمیل‌ها، آدرس ایمیل خود را وارد کنید." 
                    : `برای شناسایی خودکار پیام‌های ${config.label}، کشور و شماره تماس خود را وارد نمایید.`}
            </p>

            <div className="w-full max-w-sm space-y-4">
                {isEmail ? (
                    <div className="relative">
                        <input 
                            type="email"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="example@company.com"
                            className="w-full bg-dark-900 border border-gray-600 rounded-xl px-4 py-3 text-left text-gray-100 focus:border-primary-500 focus:outline-none placeholder-gray-600 transition-all dir-ltr"
                            autoFocus
                        />
                    </div>
                ) : (
                    <div className="flex gap-2" dir="ltr">
                        {/* Country Code Selector */}
                        <div className="relative w-28 flex-shrink-0">
                            <select 
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="w-full h-full appearance-none bg-dark-900 border border-gray-600 rounded-xl px-3 pl-8 py-3 text-sm text-gray-100 focus:border-primary-500 focus:outline-none cursor-pointer"
                            >
                                {COUNTRY_CODES.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.code} {c.country}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-lg">
                                {COUNTRY_CODES.find(c => c.code === countryCode)?.flag}
                            </div>
                        </div>

                        {/* Phone Number Input */}
                        <input 
                            type="tel"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="9123456789"
                            className="flex-1 bg-dark-900 border border-gray-600 rounded-xl px-4 py-3 text-left text-gray-100 focus:border-primary-500 focus:outline-none placeholder-gray-600 transition-all"
                            autoFocus
                        />
                    </div>
                )}

                <div className="flex gap-2">
                    <button 
                        onClick={() => setConnectingPlatform(null)}
                        className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 hover:bg-dark-700 hover:text-gray-200 transition-colors text-sm"
                    >
                        انصراف
                    </button>
                    <button 
                        onClick={confirmConnection}
                        disabled={!inputValue || isSimulatingLink}
                        className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        {isSimulatingLink ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                در حال اتصال...
                            </>
                        ) : (
                            "بررسی و اتصال"
                        )}
                    </button>
                </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-4 opacity-70">
                با اتصال حساب، پیام‌های جدید به صورت خودکار توسط هوش مصنوعی پردازش می‌شوند.
            </p>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-dark-900 w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-dark-950">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-600/20 rounded-lg">
                <Download size={20} className="text-primary-400" />
            </div>
            <div>
                <h3 className="font-bold text-gray-100">دریافت پیام‌ها</h3>
                <p className="text-xs text-gray-400">اتصال به پیام‌رسان‌ها و ایمیل</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
            <button 
                onClick={() => setActiveTab('inbox')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 
                ${activeTab === 'inbox' ? 'border-primary-500 text-primary-400 bg-primary-500/5' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
            >
                صندوق ورودی
            </button>
            <button 
                onClick={() => setActiveTab('manual')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 
                ${activeTab === 'manual' ? 'border-primary-500 text-primary-400 bg-primary-500/5' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
            >
                وارد کردن دستی
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-dark-900 relative">
            {activeTab === 'inbox' ? (
                connectingPlatform ? (
                    renderConnectionForm()
                ) : (
                    <div className="space-y-6">
                        
                        {/* Connection Status Section */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-gray-500 px-1">سرویس‌های در دسترس</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {activePlatformFilter.map(platform => {
                                    const config = PLATFORM_CONFIG[platform];
                                    const Icon = config.icon;
                                    const isConnected = !!connectedAccounts[platform];
                                    const identifier = connectedAccounts[platform];

                                    return (
                                        <div key={platform} className={`flex items-center justify-between p-3 rounded-xl border transition-all
                                            ${isConnected ? 'bg-dark-950 border-emerald-500/30' : 'bg-dark-800 border-gray-800 hover:border-gray-700'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                                                    <Icon size={18} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-medium ${isConnected ? 'text-gray-200' : 'text-gray-400'}`}>{config.label}</span>
                                                    <span className="text-[10px] text-gray-500 truncate max-w-[100px]">
                                                        {isConnected ? identifier : 'متصل نیست'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {isConnected ? (
                                                <button 
                                                    onClick={() => onDisconnect(platform)}
                                                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="قطع اتصال"
                                                >
                                                    <Unplug size={16} />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => startConnectionFlow(platform)}
                                                    className="px-3 py-1.5 text-xs bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors shadow-lg shadow-primary-500/10"
                                                >
                                                    اتصال
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Messages List Section */}
                        <div className="space-y-3 pt-4 border-t border-gray-800/50">
                            <div className="flex items-center justify-between px-1">
                                <h4 className="text-xs font-semibold text-gray-500">پیام‌های دریافتی اخیر</h4>
                                {isScanning && (
                                    <span className="text-[10px] text-primary-400 flex items-center gap-1 animate-pulse">
                                        <Loader2 size={10} className="animate-spin" />
                                        در حال جستجو...
                                    </span>
                                )}
                            </div>

                            {availableMessages.length > 0 ? (
                                availableMessages.map((msg) => {
                                    const config = PLATFORM_CONFIG[msg.platform];
                                    const Icon = config.icon;
                                    return (
                                        <button 
                                            key={msg.id}
                                            onClick={() => {
                                                onImport(msg.fullContent, msg.platform, msg.sender);
                                                onClose();
                                            }}
                                            className="w-full text-right p-4 rounded-xl border border-gray-800 bg-dark-800 hover:border-primary-500/30 hover:bg-dark-800/80 transition-all group relative overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-300"
                                        >
                                            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-lg ${config.bg} ${config.color}`}>
                                                        <Icon size={16} />
                                                    </div>
                                                    <span className="font-semibold text-gray-200 text-sm">{msg.sender}</span>
                                                </div>
                                                <span className="text-[10px] text-gray-500">{msg.time}</span>
                                            </div>
                                            <h4 className="text-sm font-medium text-gray-300 mb-1 truncate">{msg.subject || msg.preview}</h4>
                                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed opacity-80">{msg.fullContent}</p>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10 text-gray-500 bg-dark-800/30 rounded-2xl border border-dashed border-gray-800">
                                    {Object.keys(connectedAccounts).some(k => activePlatformFilter.includes(k as Platform)) ? (
                                        <>
                                            <CheckCircle2 size={40} className="mx-auto mb-3 opacity-20" />
                                            <p className="text-sm">همه پیام‌ها بررسی شده‌اند</p>
                                        </>
                                    ) : (
                                        <>
                                            <Wifi size={40} className="mx-auto mb-3 opacity-20" />
                                            <p className="text-sm font-medium">هیچ حسابی متصل نیست</p>
                                            <p className="text-xs opacity-50 mt-1 max-w-[200px] mx-auto">
                                                برای مشاهده پیام‌ها، ابتدا حساب واتساپ یا تلگرام خود را متصل کنید.
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )
            ) : (
                <div className="space-y-4">
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                        {activePlatformFilter.map(p => {
                             const config = PLATFORM_CONFIG[p];
                             const Icon = config.icon;
                             return (
                                <button
                                    key={p}
                                    onClick={() => setSelectedPlatform(p)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all whitespace-nowrap
                                    ${selectedPlatform === p 
                                        ? `${config.bg} ${config.border} ${config.color}` 
                                        : 'border-gray-700 text-gray-400 hover:bg-dark-800'}`}
                                >
                                    <Icon size={16} />
                                    {config.label}
                                </button>
                             );
                        })}
                    </div>
                    <textarea
                        value={manualText}
                        onChange={(e) => setManualText(e.target.value)}
                        placeholder="متن پیام دریافتی را اینجا کپی کنید..."
                        className="w-full h-40 bg-dark-800 border border-gray-700 rounded-xl p-4 text-sm text-gray-100 focus:border-primary-500 focus:outline-none resize-none placeholder-gray-600"
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={handleManualImport}
                            disabled={!manualText.trim()}
                            className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-primary-500/20"
                        >
                            <MessageSquarePlus size={18} />
                            تحلیل و پاسخ‌دهی
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default IntegrationModal;