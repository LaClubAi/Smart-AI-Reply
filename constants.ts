import { AssistantMode, Platform, MockMessage } from './types';
import { 
  MessageSquare, 
  Mail, 
  Activity, 
  Smartphone,
  MessageCircle,
  Send
} from 'lucide-react';

export const MODE_CONFIG = {
  [AssistantMode.GENERAL_CHAT]: {
    label: 'چت عمومی',
    icon: MessageSquare,
    description: 'گفتگو (فارسی، انگلیسی، روسی)',
    integrations: [] as Platform[],
    systemInstruction: `You are a highly intelligent, polite, and professional AI assistant. 
    You are fluent in Persian (Farsi), English (American), and Russian.
    
    Your Rules:
    1. AUTOMATICALLY DETECT the language of the user's input.
    2. If the user writes in Persian, respond in Persian.
    3. If the user writes in English, respond in American English.
    4. If the user writes in Russian, respond in Russian.
    5. Maintain a helpful and respectful tone in all languages.
    6. If the user asks about the app's connectivity, clarify that you simulate interactions and do not have direct API access to WhatsApp/Telegram servers.`
  },
  [AssistantMode.EMAIL_PROFESSIONAL]: {
    label: 'پاسخ‌دهی ایمیل',
    icon: Mail,
    description: 'تنظیم پاسخ‌های رسمی و اداری',
    integrations: ['email'] as Platform[],
    systemInstruction: `You are an expert executive assistant specializing in professional communication.
    
    Your Task:
    Draft clear, concise, and professional email responses.
    
    Language Support:
    - Persian: Use standard business etiquette (Edari/Rasmi).
    - English: Use professional American business English.
    - Russian: Use formal Russian (Vy style).
    
    Always match the language of the input email or the user's request.`
  },
  [AssistantMode.INSTANT_MESSAGING]: {
    label: 'واتساپ و تلگرام',
    icon: Smartphone,
    description: 'پاسخ‌های کوتاه و موثر',
    integrations: ['whatsapp', 'telegram'] as Platform[],
    systemInstruction: `You are a social media communication expert helping with WhatsApp and Telegram replies.
    
    Languages: Persian, English (American), Russian.
    
    Guidelines:
    - Context is key. Identify if the context is friendly (Samimaneh) or semi-formal.
    - English: Use American idioms or casual phrasing if appropriate.
    - Russian: Distinguish between 'Ty' (informal) and 'Vy' (formal) based on context.
    - Keep responses concise. You may use emojis.`
  },
  [AssistantMode.TONE_ANALYSIS]: {
    label: 'شناسایی لحن',
    icon: Activity,
    description: 'تحلیل روانشناختی و احساسی',
    integrations: [] as Platform[],
    systemInstruction: `You are an expert linguist and psychologist specializing in tone analysis for Persian, English, and Russian texts. 
    The user will provide a text. You must analyze it and return the result in JSON format ONLY, adhering to this schema:
    {
      "emotion": "Detected emotion (e.g., Angry, Happy, Sarcastic)",
      "intensity": "Low" | "Medium" | "High",
      "politeness": "Polite" | "Rude" | "Neutral",
      "suggestion": "A brief advice on how to respond to this tone in the SAME language as the input text."
    }
    Do not output markdown code blocks, just the raw JSON.`
  }
};

export const PLATFORM_CONFIG = {
  whatsapp: { label: 'واتساپ', icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  telegram: { label: 'تلگرام', icon: Send, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  email: { label: 'ایمیل', icon: Mail, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
};

export const MOCK_INBOX_DATA: MockMessage[] = [
  {
    id: 'w1',
    platform: 'whatsapp',
    sender: 'مدیر پروژه (علی)',
    preview: 'سلام، فایل ارائه فردا آماده شد؟',
    fullContent: 'سلام وقت بخیر. علی هستم. فایل ارائه جلسه فردا آماده شد؟ اگر نیاز به ویرایش داره لطفا تا آخر شب بهم بگو. ممنون.',
    time: '۱۰:۳۰ ق.ظ'
  },
  {
    id: 'w2',
    platform: 'whatsapp',
    sender: 'Sarah (Marketing USA)',
    preview: 'Update on the Q3 campaign?',
    fullContent: 'Hey! Hope you are doing well. Do you have the latest stats for the Q3 social media campaign? We need to finalize the deck for the board meeting. Thanks!',
    time: '14:15'
  },
  {
    id: 't1',
    platform: 'telegram',
    sender: 'گروه پشتیبانی فنی',
    preview: 'سرور شماره ۳ دان شده، لطفا چک کنید...',
    fullContent: 'سلام مهندس. گزارش‌ها نشون میده سرور شماره ۳ دان شده. مشتری‌ها دارن شکایت می‌کنن. لطفا سریعا لاگ‌ها رو چک کنید و اطلاع بدید.',
    time: '۱۱:۴۵ ق.ظ'
  },
  {
    id: 't2',
    platform: 'telegram',
    sender: 'Dmitry (Developer)',
    preview: 'Привет, есть вопрос по API',
    fullContent: 'Привет! Я посмотрел документацию. Кажется, эндпоинт авторизации возвращает 403. Ты не мог бы проверить права доступа для моего токена?',
    time: '16:20'
  },
  {
    id: 'e1',
    platform: 'email',
    sender: 'شرکت تجارت نوین <info@tejarat.co>',
    subject: 'درخواست همکاری و جلسه حضوری',
    preview: 'با سلام و احترام، پیرو مذاکرات تلفنی...',
    fullContent: 'با سلام و احترام،\nپیرو مذاکرات تلفنی هفته گذشته، بدینوسیله از جنابعالی دعوت می‌شود جهت نهایی‌سازی قرارداد همکاری در روز دوشنبه ساعت ۱۰ صبح در دفتر مرکزی حضور بهم رسانید.\n\nبا تشکر\nمدیریت شرکت تجارت نوین',
    time: 'دیروز'
  }
];