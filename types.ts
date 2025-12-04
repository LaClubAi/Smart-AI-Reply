export enum AssistantMode {
  GENERAL_CHAT = 'GENERAL_CHAT',
  EMAIL_PROFESSIONAL = 'EMAIL_PROFESSIONAL',
  INSTANT_MESSAGING = 'INSTANT_MESSAGING', // WhatsApp/Telegram
  TONE_ANALYSIS = 'TONE_ANALYSIS'
}

export type Platform = 'whatsapp' | 'telegram' | 'email';

export type ConnectedAccounts = {
  [key in Platform]?: string; // stores the identifier (phone number or email address)
};

export interface MockMessage {
  id: string;
  sender: string;
  subject?: string; // For emails
  preview: string;
  fullContent: string;
  platform: Platform;
  time: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  toneAnalysis?: ToneAnalysisResult; // Only for specific modes
  platformSource?: Platform; // To visually indicate source
}

export interface ToneAnalysisResult {
  emotion: string;
  intensity: 'Low' | 'Medium' | 'High';
  politeness: string;
  suggestion: string;
}

export interface ChatSession {
  id: string;
  name: string;
  mode: AssistantMode;
  messages: Message[];
}