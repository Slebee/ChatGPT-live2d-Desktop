import { Store } from 'tauri-plugin-store-api';
import { proxy, subscribe } from 'valtio';
import { debounce, deepMerge } from '.';

export async function proxyWithPersist<T extends object>(
  name: string,
  data: T,
  events?: {
    onSave?: (name: string, data: T) => void;
  },
) {
  const store = new Store(`./${name}.json`);
  let dataWithPrev: T = data;
  const prevData: Record<string, any> | null = await store.get(name);
  if (prevData !== null) {
    dataWithPrev = deepMerge(data, prevData) as T;
  }
  const p = proxy<T>(dataWithPrev);
  const save = debounce(async (name: string, d: T) => {
    await store.set(name, d);
    await store.save();
    events?.onSave?.(name, d);
  }, 500);
  subscribe(p, () => {
    save(name, p);
  });
  return p;
}
