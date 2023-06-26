import { ChatMessage } from './pages/chat/stores/chats';
import { Robot } from './pages/chat/stores/robots';
import { appSettingState } from './stores/setting';
import { request } from './utils/request';

export type Response = {
  text: string;
  channelId?: string;
  conversationId?: string;
};

export enum PoeBotNames {
  'Claude-instant' = 'a2',
  'Claude-instant-100k' = 'a2_100k',
  'Claude+' = 'a2_2',
  'GPT-4' = 'beaver',
  'Sage' = 'capybara',
  'ChatGPT' = 'chinchilla',
  'gpt0522' = 'gpt0522',
  'NeevaAI' = 'hutia',
  'Dragonfly' = 'nutria',
}
export const botAvatars = {
  [PoeBotNames['Claude-instant']]: '/poe/anthropicAvatarBeige.426c3b88.png',
  [PoeBotNames['Claude-instant-100k']]:
    '/poe/anthropicAvatarBeigeBeta.67f1cfb9.png',
  [PoeBotNames['Claude+']]: '/poe/anthropicAvatarBrown.e8c26390.png',
  [PoeBotNames['GPT-4']]: '/poe/openAIBlue.915c0399.png',
  [PoeBotNames['Sage']]: '/poe/purpleAvatar.d066304c.png',
  [PoeBotNames['ChatGPT']]: '/poe/chatGPTAvatar.04ed8443.png',
  [PoeBotNames['gpt0522']]: '/poe/defaultAvatar.7e5c73d2.png',
  [PoeBotNames['NeevaAI']]: '/poe/neevaAvatar.3eacd71c.png',
  [PoeBotNames['Dragonfly']]: '/poe/blueAvatar.d858b62d.png',
};

export type PoeBot = {
  botId: number;
  defaultBotNickName: string;
  contextClearWindowSecs?: number;
  creator: {
    fullName: string;
    handle: string;
    id: string;
    profilePhotoUrl: string;
    __isNode: string;
  };
  deletionState: 'not_deleted' | 'user_deleted';
  /** "Anthropic’s fastest model, with strength in creative tasks. Features a context window of 9k tokens (around 7,000 words)." */
  description: string;
  /** "This bot may make incorrect statements. It does not have knowledge of events after 2021. " */
  disclaimerText: string;
  displayName: string;
  handle?: string;
  hasClearContext: boolean;
  hasSuggestedReplies: boolean;
  hasWelcomeTopics: boolean;
  messageLimit: {
    dailyBalance: number | null;
    dailyLimit: number | null;
    numMessagesRemaining: number | null;
    resetTime: number;
    shouldShowRemainingMessageCount: boolean;
  };
  isApiBot: boolean;
  isDown: boolean;
  isLimitedAccess: boolean;
  isPrivateBot: boolean;
  isSystemBot: boolean;
  model: string;
  nickname: string;
  /** 机器人设定指令 */
  promptPlaintext: string;
  poweredBy: string;
  avatar?: string;
};
type BaseResponse<T> = {
  status: 'success' | 'failed';
  data: T;
};
export const clearPoeRobotContext = (bot: PoeBotNames) => {
  return request.post<{
    status: string;
    response: string;
  }>(`${appSettingState.poe.basePath}/bot/clear`, {
    bot_model: bot,
  });
};

export const getBotInfoByDisplayName = (displayName: string) => {
  return request.get<
    BaseResponse<{
      defaultBotNickname: string;
      defaultBotObject: PoeBot;
    }>
  >(`${appSettingState.poe.basePath}/bot/${displayName}/info`);
};

export const getPoeBots = () =>
  request
    .get<{
      bots: PoeBot[];
      status: string;
    }>(`${appSettingState.poe.basePath}/bot/bots`)
    .then((res) => {
      if (res.data.status === 'success') {
        // @ts-ignore
        const sourceBots = res.data.data as Record<
          string,
          {
            defaultBotObject: PoeBot;
          }
        >;
        const arr: PoeBot[] = [];
        const keys = Object.keys(sourceBots);
        keys.forEach((key) => {
          arr.push({
            ...sourceBots[key].defaultBotObject,
            avatar:
              botAvatars[key as PoeBotNames] ||
              '/poe/defaultAvatar.7e5c73d2.png',
            defaultBotNickName: key,
          });
        });
        return {
          ...res,
          data: {
            bots: arr,
            status: res.data.status,
          },
        };
      }
      return res;
    });

export const generate = async (
  messages: ChatMessage[],
  robot?: Robot,
): Promise<Response> => {
  console.log(messages);
  const text = messages[messages.length - 1].content;
  console.log(robot?.botId);
  console.log(text);
  const value = await request.post<{
    status: string;
    response: string;
  }>(
    `${appSettingState.poe.basePath}/bot/message/stream`,
    {
      bot_model: robot?.botId,
      message: text,
      with_chat_break: false,
    },
    {
      responseType: 'stream',
      timeout: 2000000,
      timeoutErrorMessage: '超时了',
      onDownloadProgress: (progressEvent) => {
        console.log(progressEvent);
      },
    },
  );
  console.log('value is', value);

  return {
    text: value.data.response,
    channelId: undefined,
    conversationId: undefined,
  };
};

export const clearContext = (bot_model: PoeBot['model']) => {
  return request.post<BaseResponse<{}>>(
    `${appSettingState.poe.basePath}/bot/context/clear`,
    {
      bot_model,
    },
  );
};
