import { useEffect, useRef } from 'react';

export const useEffectOnce = (effect: () => void, deps?: any[]) => {
  const didRun = useRef(false);

  useEffect(() => {
    if (!didRun.current) {
      effect();
      didRun.current = true;
    }

    return () => {
      // cleanup
    };
  }, deps);
};
