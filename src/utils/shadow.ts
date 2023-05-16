import { invoke } from '@tauri-apps/api';

export async function setShadow(windowName: string) {
  await invoke('set_shadow', { label: windowName });
}
