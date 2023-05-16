import { GptMessageItem, generate as askGpt } from './gpt';
import { generate as askClaude } from './claude';
import { appSettingState } from './stores/setting';
import { Speaker } from './types';
import { request } from './utils/request';
import { ChatMessage } from './pages/chat/stores/chats';
import { Robot } from './pages/chat/stores/robots';

export const fetchSpeakers = () =>
  request.get<{
    VITS: Speaker[];
  }>(`${appSettingState.vits.basePath}/voice/speakers`);

const platforms = {
  gpt: askGpt,
  claude: askClaude,
};
export const ask = ({
  platform,
  messages,
  robot,
}: {
  platform: keyof typeof platforms;
  messages: ChatMessage[];
  robot: Robot;
}) => {
  return platforms[platform](messages, robot);
};
