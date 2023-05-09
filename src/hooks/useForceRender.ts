import { useCallback, useState } from 'react';

export const useForceRender = () => {
  const [, setTick] = useState(0);
  const forceRender = useCallback(() => {
    setTick((tick) => tick + 1);
  }, []);
  return forceRender;
};
