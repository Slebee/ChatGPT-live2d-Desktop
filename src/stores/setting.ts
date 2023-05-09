import { useSnapshot } from 'valtio';
import { darkMode, proxyWithPersist } from '@/utils';

export const sendKeyOptions = ['Enter', 'Ctrl+Enter'] as const;
export const modelOptions = [
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-4-0314',
  'gpt-4-32k',
  'gpt-4-32k-0314',
  'gpt-3.5-turbo-0301',
];
export type AppSetting = {
  opened: boolean;
  theme: 'light' | 'dark';
  language: string;
  fontSize: number;
  avatar: string;
  openAI: {
    apiKey: string;
    model: (typeof modelOptions)[number];
    temperature: number;
    maxTokens: number;
    presencePenalty: number;
    basePath?: string;
    // chat history size
    historySize?: number;
  };
  chat: {
    sendKey: (typeof sendKeyOptions)[number];
  };

  vits: {
    basePath?: string;
    // allow play audio
    allowAudio?: boolean;
  };
};
export const appSettingState = proxyWithPersist<AppSetting>('appSetting', {
  opened: false,
  theme: 'light',
  language: 'zh-CN',
  fontSize: 14,
  avatar: '/avatars/avatar.png',
  chat: {
    sendKey: sendKeyOptions[1],
  },
  openAI: {
    apiKey: '',
    model: modelOptions[0],
    temperature: 1.0,
    maxTokens: 2000,
    presencePenalty: 0.0,
    basePath: 'https://api.openai.com/v1',
    historySize: 10,
  },
  vits: {
    basePath: 'http://127.0.0.1:23456',
    allowAudio: true,
  },
});

export const useAppSetting = () => {
  const setting = useSnapshot(appSettingState);
  return [setting];
};

export const appSettingActions = {
  setSendKey: (sendKey: (typeof sendKeyOptions)[number]) => {
    appSettingState.chat.sendKey = sendKey;
  },
  setBathPath: (basePath: string) => {
    appSettingState.openAI.basePath = basePath;
  },
  setModel: (model: (typeof modelOptions)[number]) => {
    appSettingState.openAI.model = model;
  },
  setApiKey: (apiKey: string) => {
    appSettingState.openAI.apiKey = apiKey;
  },
  setTemperature: (temperature: number) => {
    appSettingState.openAI.temperature = temperature;
  },
  setMaxTokens: (maxTokens: number) => {
    appSettingState.openAI.maxTokens = maxTokens;
  },
  setLanguage: (language: string) => {
    appSettingState.language = language;
  },
  setTheme: (theme: 'light' | 'dark') => {
    appSettingState.theme = theme;
  },
  setChatHistorySize: (historySize: number) => {
    appSettingState.openAI.historySize = historySize;
  },
  toggleTheme: () => {
    const nextTheme = appSettingState.theme === 'light' ? 'dark' : 'light';
    if (nextTheme === 'dark') {
      darkMode.enable();
    } else {
      darkMode.disable();
    }
    appSettingState.theme = nextTheme;
  },
  setPresencePenalty: (presencePenalty: number) => {
    appSettingState.openAI.presencePenalty = presencePenalty;
  },
  openSetting: () => {
    appSettingState.opened = true;
  },
  closeSetting: () => {
    appSettingState.opened = false;
  },
  toggleSetting: (opened?: boolean) => {
    if (opened !== undefined) {
      appSettingState.opened = opened;
      return;
    }
    appSettingState.opened = !appSettingState.opened;
  },
  setVitsBasePath: (basePath: string) => {
    appSettingState.vits.basePath = basePath;
  },
  setVitsAllowAudio: (allowAudio: boolean) => {
    appSettingState.vits.allowAudio = allowAudio;
  },
  toggleVisAllowAudio: () => {
    appSettingState.vits.allowAudio = !appSettingState.vits.allowAudio;
  },
};
