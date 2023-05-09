import { emit } from '@tauri-apps/api/event';
import { proxy, useSnapshot } from 'valtio';

/**
 * this model only record the notices that has been shown to user
 */

export type Notice = {
  msg: string;
};
const noticesState = proxy<{
  notices: Notice[];
}>({
  notices: [],
});

export const useNotices = () => {
  const notices = useSnapshot(noticesState);
  return [notices];
};

export const noticesActions = {
  addNotice: (notice: Notice) => {
    emit('addNotice', notice);
    noticesState.notices.push(notice);
  },
};
