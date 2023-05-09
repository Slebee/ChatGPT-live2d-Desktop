import { useEffect } from 'react';

export const useEventListener = (event: string, handler: (e: any) => void) => {
  useEffect(() => {
    window.addEventListener(event, handler);
    return () => window.removeEventListener(event, handler);
  }, [event, handler]);
};
