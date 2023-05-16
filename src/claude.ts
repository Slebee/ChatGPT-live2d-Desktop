import { ChatMessage } from './pages/chat/stores/chats';
import { Robot } from './pages/chat/stores/robots';
import { appSettingState } from './stores/setting';
import { request } from './utils/request';

export type ClaudeResponse = {
  text: string;
  channelId: string;
  conversationId?: string;
};
export const generate = async (
  messages: ChatMessage[],
  robot?: Robot,
): Promise<ClaudeResponse> => {
  console.log(messages);
  const assistantMessages = [...messages]
    .reverse()
    .filter((m) => m.sender === 'assistant');
  const text = messages[messages.length - 1].content;
  const conversationId = assistantMessages[0]?.conversationId;
  const { token, appId, server } = appSettingState.claude;

  console.log('conversationId', conversationId);
  console.log('robotId', robot?.claude?.channelId);
  const value = await request.post<ClaudeResponse>(
    `${server}/chat`,
    {
      token,
      appId,
      channelId: robot?.claude?.channelId,
      message: text,
      conversationId,
    } as {
      token: string;
      appId: string;
      channelId?: string;
      message: string;
      conversationId?: string;
    },
    {
      timeout: 60000,
    },
  );
  return value.data;
};
