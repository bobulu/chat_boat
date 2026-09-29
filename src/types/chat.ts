export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Session {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  messages: Message[];
  systemInstruction?: string;
  temperature?: number;
}

export type ThemeMode = 'dark' | 'light' | 'system';

export interface AppSettings {
  theme: ThemeMode;
  systemInstruction: string;
  temperature: number;
  sendOnEnter: boolean;
  showWordCount: boolean;
  fontSize: 'sm' | 'base' | 'lg';
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  systemInstruction: 'You are NovaChat, an intelligent, helpful, and privacy-respecting AI assistant. You write clean, well-formatted markdown, explain concepts clearly, and provide concise yet comprehensive answers.',
  temperature: 0.7,
  sendOnEnter: true,
  showWordCount: true,
  fontSize: 'base',
};
