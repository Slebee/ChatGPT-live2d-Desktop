import { appSettingState } from './stores/setting';
import { Speaker } from './types';
import { request } from './utils/request';

export const fetchSpeakers = () =>
  request.get<{
    VITS: Speaker[];
  }>(`${appSettingState.vits.basePath}/voice/speakers`);
