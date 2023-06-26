import { Store } from 'tauri-plugin-store-api';
import { proxy, subscribe } from 'valtio';
import { debounce, deepMerge } from '.';

let storesReadCount: Record<string, number> = {};
export async function proxyWithPersist<T extends object>(
  name: string,
  data: T,
  events?: {
    onSave?: (name: string, data: T) => void;
    onRead?: (count: number, prevData: T | null) => void;
  },
) {
  const store = new Store(`./${name}.json`);
  storesReadCount[name] = storesReadCount[name] || 0;
  storesReadCount[name] += 1;
  let dataWithPrev: T = data;
  const prevData: T | null = await store.get(name);
  events?.onRead?.(storesReadCount[name], prevData);
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
