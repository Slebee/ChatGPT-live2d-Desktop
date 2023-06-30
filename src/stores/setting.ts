import { useSnapshot } from 'valtio';
import { darkMode } from '@/utils';
import { proxyWithPersist } from '@/utils/storage';
import { emit } from '@tauri-apps/api/event';
import { Events } from '@/enum/events';
import { setLocale } from 'umi';

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

  poe: {
    basePath?: string;
    pb?: string;
    proxy?: string;
    enabled?: boolean;
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

const defaultPoe = {
  basePath: '',
  pb: '',
  enabled: false,
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
    poe: { ...defaultPoe },
  },
  {
    onSave: async (_, setting) => {
      if (setting.basic.theme === 'dark') {
        if (!darkMode.isEnabled()) {
          darkMode.enable();
        }
      } else if (setting.basic.theme === 'light') {
        if (darkMode.isEnabled()) {
          darkMode.disable();
        }
      }
      if (setting.basic.language) {
        console.log('language', setting.basic.language);
        const prevLang = setting.basic.language === 'zh-CN' ? 'en-US' : 'zh-CN';

        /**
         * 由于umi的bug，需要先设置为其他语言，再设置为目标语言，不然会出现死活不生效的情况
         */
        setLocale(prevLang, false);
        setLocale(setting.basic.language, false);
      }

      if (window.location.href.includes('setting')) {
        // 只有设置页面才会触发，否则会死循环，需要更好的实现方式
        await emit(Events.settingChanged, setting);
      }
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

  /** poe */
  updatePoeSetting: (poe: Partial<AppSetting['poe']>) => {
    appSettingState.poe = { ...appSettingState.poe, ...poe };
  },
  resetPoeSetting: () => {
    appSettingState.poe = { ...defaultPoe };
  },

  toggleTheme: () => {
    const nextTheme =
      appSettingState.basic.theme === 'light' ? 'dark' : 'light';
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

  updateSetting: (setting: AppSetting) => {
    appSettingState.baiduTranslate = setting.baiduTranslate;
    appSettingState.basic = setting.basic;
    appSettingState.chat = setting.chat;
    appSettingState.claude = setting.claude;
    appSettingState.openAI = setting.openAI;
    appSettingState.vits = setting.vits;
    appSettingState.poe = setting.poe;
  },
};
