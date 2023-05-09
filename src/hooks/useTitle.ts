import { useEffect } from 'react';

export const useTitle = () => {
  const setTitle = (title: string) => {
    document.title = title;
  };

  useEffect(() => {
    const currentTitle = document.title;
    return () => {
      document.title = currentTitle;
    };
  }, []);
  return setTitle;
};
