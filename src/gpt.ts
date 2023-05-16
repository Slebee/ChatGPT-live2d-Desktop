import { Configuration, OpenAIApi, CreateChatCompletionRequest } from 'openai';
import { appSettingState } from './stores/setting';
import { ChatMessage } from './pages/chat/stores/chats';
import { Robot } from './pages/chat/stores/robots';

export type GptMessageItem = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};
export const generate = async (messages: ChatMessage[], robot?: Robot) => {
  const configuration = new Configuration({
    apiKey: appSettingState.openAI.apiKey,
    basePath: appSettingState.openAI.basePath,
  });
  const openAiApi = new OpenAIApi(configuration);
  const params: CreateChatCompletionRequest = {
    messages: messages.map((message) => ({
      content: message.content,
      role: message.sender as 'user' | 'assistant' | 'system',
    })),
    temperature: appSettingState.openAI.temperature,
    max_tokens: appSettingState.openAI.maxTokens,
    model: appSettingState.openAI.model,
    presence_penalty: appSettingState.openAI.presencePenalty,
  };
  try {
    const response = await openAiApi.createChatCompletion(
      params,
      // {
      //   timeout: 10000,
      // },
      // proxyAxiosOptions,
    );
    return {
      text: response.data.choices[0].message?.content,
      channel: undefined,
      conversationId: undefined,
    };
  } catch (error: any) {
    throw new Error(error);
  }
};
