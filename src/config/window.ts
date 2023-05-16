import { WindowOptions } from '@tauri-apps/api/window';

export const windowConfig: Record<string, WindowOptions> = {
  live2d: {
    url: '/live2d',
    resizable: false,
    decorations: false,
    width: 400,
    skipTaskbar: true,
    transparent: true,
    fileDropEnabled: false,
  },
  setting: {
    url: '/setting',
    decorations: false,
  },
};
