import { useSnapshot } from 'valtio';
import { darkMode } from '@/utils';
import { proxyWithPersist } from '@/utils/storage';
import { emit } from '@tauri-apps/api/event';
import { Events } from '@/enum/events';

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
  basic: {
    opened: boolean;
    theme: 'light' | 'dark';
    language: string;
    fontSize: number;
    avatar: string;
  };
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
  claude: {
    server?: string;
    token?: string;
    appId?: string;
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

const defaultClaude = {
  server: 'http://localhost:3101',
  token: '',
  appId: '',
};

const defaultChat = {
  sendKey: sendKeyOptions[1],
};
const defaultOpenAI = {
  apiKey: '',
  model: modelOptions[0],
  temperature: 1.0,
  maxTokens: 2000,
  presencePenalty: 0.0,
  basePath: 'https://api.openai.com/v1',
  historySize: 10,
};
const defaultVits = {
  basePath: 'http://127.0.0.1:23456',
  allowAudio: true,
};
const defaultBasicSetting: AppSetting['basic'] = {
  opened: false,
  theme: 'light',
  language: 'zh-CN',
  fontSize: 14,
  avatar: '/avatars/avatar.png',
};
export const appSettingState = await proxyWithPersist<AppSetting>(
  'appSetting',
  {
    basic: { ...defaultBasicSetting },
    chat: { ...defaultChat },
    openAI: { ...defaultOpenAI },
    vits: { ...defaultVits },
    claude: { ...defaultClaude },
  },
  {
    onSave: async (_, data) => {
      await emit(Events.settingChanged, {
        theme: data.basic.theme,
      });
    },
  },
);

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
    appSettingState.basic.language = language;
  },
  setTheme: (theme: 'light' | 'dark') => {
    appSettingState.basic.theme = theme;
  },
  setChatHistorySize: (historySize: number) => {
    appSettingState.openAI.historySize = historySize;
  },
  toggleTheme: () => {
    const nextTheme =
      appSettingState.basic.theme === 'light' ? 'dark' : 'light';
    if (nextTheme === 'dark') {
      darkMode.enable();
    } else {
      darkMode.disable();
    }
    appSettingState.basic.theme = nextTheme;
  },
  setPresencePenalty: (presencePenalty: number) => {
    appSettingState.openAI.presencePenalty = presencePenalty;
  },
  openSetting: () => {
    appSettingState.basic.opened = true;
  },
  closeSetting: () => {
    appSettingState.basic.opened = false;
  },
  toggleSetting: (opened?: boolean) => {
    if (opened !== undefined) {
      appSettingState.basic.opened = opened;
      return;
    }
    appSettingState.basic.opened = !appSettingState.basic.opened;
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

  setAvatar: (avatarPath: string) => {
    appSettingState.basic.avatar = avatarPath;
  },

  resetBasicSetting: () => {
    appSettingState.basic = { ...defaultBasicSetting };
  },

  resetOpenAISetting: () => {
    appSettingState.openAI = { ...defaultOpenAI };
  },

  resetVitsSetting: () => {
    appSettingState.vits = { ...defaultVits };
  },

  resetChatSetting: () => {
    appSettingState.chat = { ...defaultChat };
  },

  updateClaudeSetting: (claude: Partial<AppSetting['claude']>) => {
    appSettingState.claude = { ...appSettingState.claude, ...claude };
  },
  resetClaudeSetting: () => {
    appSettingState.claude = { ...defaultClaude };
  },
};
