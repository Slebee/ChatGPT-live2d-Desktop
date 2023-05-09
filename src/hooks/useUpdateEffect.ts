import { useEffect, useRef } from 'react';

// useUpdateEffect 用法等同于 useEffect，但是会忽略首次执行，只在依赖更新时执行。
export default function useUpdateEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList,
) {
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    return effect();
  }, deps);
}
