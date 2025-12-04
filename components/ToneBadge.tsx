import React from 'react';
import { ToneAnalysisResult } from '../types';
import { Smile, Frown, Meh, AlertCircle, Zap } from 'lucide-react';

interface Props {
  data: ToneAnalysisResult;
}

const ToneBadge: React.FC<Props> = ({ data }) => {
  const getIcon = () => {
    const e = data.emotion.toLowerCase();
    if (e.includes('happy') || e.includes('joy') || e.includes('polite')) return <Smile className="w-5 h-5 text-green-400" />;
    if (e.includes('angry') || e.includes('rude') || e.includes('aggressive')) return <AlertCircle className="w-5 h-5 text-red-400" />;
    if (e.includes('sad')) return <Frown className="w-5 h-5 text-blue-400" />;
    return <Meh className="w-5 h-5 text-yellow-400" />;
  };

  const getIntensityColor = () => {
    switch(data.intensity) {
      case 'High': return 'bg-red-500/20 text-red-200 border-red-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-200 border-blue-500/30';
    }
  };

  return (
    <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10 text-sm animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
        <ActivityIcon />
        <span className="font-semibold text-gray-200">تحلیل هوشمند لحن</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-gray-300">حس: {translateEmotion(data.emotion)}</span>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-xs text-center border w-fit ${getIntensityColor()}`}>
           شدت: {translateIntensity(data.intensity)}
        </div>
      </div>
      
      <p className="text-gray-400 text-xs leading-relaxed">
        <span className="text-primary-400 font-medium">پیشنهاد:</span> {data.suggestion}
      </p>
    </div>
  );
};

const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
)

// Simple helpers to translate raw model output if it comes in English
const translateEmotion = (en: string) => {
  const map: Record<string, string> = {
    'Happy': 'خوشحال', 'Angry': 'عصبانی', 'Sad': 'ناراحت', 'Neutral': 'خنثی', 
    'Polite': 'مودبانه', 'Rude': 'بی‌ادبانه', 'Sarcastic': 'کنایه‌آمیز', 'Professional': 'رسمی',
    'Friendly': 'دوستانه', 'Aggressive': 'تهاجمی'
  };
  return map[en] || en;
};

const translateIntensity = (en: string) => {
   const map: Record<string, string> = { 'High': 'زیاد', 'Medium': 'متوسط', 'Low': 'کم' };
   return map[en] || en;
}

export default ToneBadge;
