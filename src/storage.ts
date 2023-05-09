// localStorage 封装
const setItem = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getItem = (key: string) => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '');
  } catch (error) {
    return null;
  }
};

const removeItem = (key: string) => {
  localStorage.removeItem(key);
};

export const storage = {
  setItem,
  getItem,
  removeItem,
};
