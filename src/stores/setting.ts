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
    folderPath?: string;
    // allow play audio
    allowAudio?: boolean;
  };

  baiduTranslate: {
    appid?: string;
    key?: string;
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
const defaultBaiduTranslate = {
  appid: undefined,
  key: undefined,
};
export const appSettingState = await proxyWithPersist<AppSetting>(
  'appSetting',
  {
    basic: { ...defaultBasicSetting },
    chat: { ...defaultChat },
    openAI: { ...defaultOpenAI },
    vits: { ...defaultVits },
    claude: { ...defaultClaude },
    baiduTranslate: { ...defaultBaiduTranslate },
  },
  {
    onSave: async () => {
      await emit(Events.settingChanged);
    },
  },
);

export const useAppSetting = () => {
  // must use sync mode. visit https://github.com/pmndrs/valtio/issues/270
  const setting = useSnapshot(appSettingState, { sync: true });
  return [setting];
};

export const appSettingActions = {
  /** basic */
  updateBasicSetting: (basic: Partial<AppSetting['basic']>) => {
    appSettingState.basic = {
      ...appSettingState.basic,
      ...basic,
    };
  },
  resetBasicSetting: () => {
    appSettingState.basic = { ...defaultBasicSetting };
  },

  /** claude */
  updateClaudeSetting: (claude: Partial<AppSetting['claude']>) => {
    appSettingState.claude = { ...appSettingState.claude, ...claude };
  },
  resetClaudeSetting: () => {
    appSettingState.claude = { ...defaultClaude };
  },

  /** Vits */
  updateVisSetting: (vits: Partial<AppSetting['vits']>) => {
    appSettingState.vits = { ...appSettingState.vits, ...vits };
  },
  resetVitsSetting: () => {
    appSettingState.vits = { ...defaultVits };
  },

  /** chat */
  updateChatSetting: (chat: Partial<AppSetting['chat']>) => {
    appSettingState.chat = { ...appSettingState.chat, ...chat };
  },
  resetChatSetting: () => {
    appSettingState.chat = { ...defaultChat };
  },

  /** openAI */
  updateOpenAISetting: (openAI: Partial<AppSetting['openAI']>) => {
    appSettingState.openAI = { ...appSettingState.openAI, ...openAI };
  },
  resetOpenAISetting: () => {
    appSettingState.openAI = { ...defaultOpenAI };
  },

  /** baiduTranslate */
  updateBaiduTranslateSetting: (
    baiduTranslate: Partial<AppSetting['baiduTranslate']>,
  ) => {
    appSettingState.baiduTranslate = {
      ...appSettingState.baiduTranslate,
      ...baiduTranslate,
    };
  },
  resetBaiduTranslateSetting: () => {
    appSettingState.baiduTranslate = { ...defaultBaiduTranslate };
  },

  toggleTheme: () => {
    const nextTheme =
      appSettingState.basic.theme === 'light' ? 'dark' : 'light';
    if (nextTheme === 'dark') {
      darkMode.enable();
    } else {
      darkMode.disable();
    }
    appSettingActions.updateBasicSetting({ theme: nextTheme });
  },

  openSetting: () => {
    appSettingActions.updateBasicSetting({ opened: true });
  },
  closeSetting: () => {
    appSettingActions.updateBasicSetting({ opened: false });
  },
  toggleSetting: (opened?: boolean) => {
    if (opened !== undefined) {
      appSettingState.basic.opened = opened;
      return;
    }
    appSettingActions.updateBasicSetting({
      opened: !appSettingState.basic.opened,
    });
  },
};
