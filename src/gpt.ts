import { Configuration, OpenAIApi, CreateChatCompletionRequest } from 'openai';
import { appSettingState } from './stores/setting';

export type GptMessageItem = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};
export const askGpt = async (messages: GptMessageItem[]) => {
  const configuration = new Configuration({
    apiKey: appSettingState.openAI.apiKey,
    basePath: appSettingState.openAI.basePath,
  });
  const openAiApi = new OpenAIApi(configuration);
  const params: CreateChatCompletionRequest = {
    messages,
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
    return response.data.choices[0].message?.content;
  } catch (error: any) {
    throw new Error(error);
  }
};
