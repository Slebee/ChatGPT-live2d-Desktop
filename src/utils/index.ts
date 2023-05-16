export async function ping(url: string): Promise<boolean> {
  try {
    return (await fetch(url)).ok;
  } catch (e) {
    return false;
  }
}
import {
  LogicalPosition,
  WebviewWindow,
  WindowOptions,
} from '@tauri-apps/api/window';
import {
  enable as enableDarkMode,
  disable as disableDarkMode,
} from 'darkreader';
import { windowConfig } from '@/config/window';

// debounce
export function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout | null;
  return function (...args: any[]) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      // @ts-ignore
      func.apply(this, args);
    }, wait);
  };
}

export const isWeb = () => {
  // @ts-ignore
  return window.__TAURI_IPC__ === undefined;
};

export const openNewWindow = (name: string, options?: WindowOptions) => {
  const chatWebView = new WebviewWindow(name, options);
  // since the webview window is created asynchronously,
  // Tauri emits the `tauri://created` and `tauri://error` to notify you of the creation response
  chatWebView.once('tauri://created', function () {
    // webview window successfully created
  });
  chatWebView.once('tauri://error', function (e) {
    // an error occurred during webview window creation
  });
};

// check if the target window is opened
export const isTargetWindowOpened = (name: string) => {
  return WebviewWindow.getByLabel(name) !== null;
};

export const isTargetWindowVisible = async (name: string) => {
  const target = WebviewWindow.getByLabel(name);
  if (target) {
    return await target.isVisible();
  }
  return false;
};

export const showWindow = async (
  name: string,
  initWindowOptions?: WindowOptions,
) => {
  const target = WebviewWindow.getByLabel(name);
  if (target) {
    await target.show();
    await target.setFocus();
  } else {
    openNewWindow(name, { ...windowConfig[name], ...initWindowOptions });
  }
};
export const hideWindow = (name: string) => {
  WebviewWindow.getByLabel(name)?.hide();
};

export const toggleWindowVisible = async (
  name: string,
  initWindowOptions?: WindowOptions,
) => {
  const target = WebviewWindow.getByLabel(name);
  if (target) {
    if (await target.isVisible()) {
      target.hide();
    } else {
      await target.show();
    }
  } else {
    console.log('openNewWindow', name, windowConfig[name], initWindowOptions);
    openNewWindow(name, { ...windowConfig[name], ...initWindowOptions });
  }
};

export const darkMode = {
  enable: () => {
    enableDarkMode({
      brightness: 90,
      contrast: 100,
      sepia: 20,
    });
  },
  disable: () => {
    disableDarkMode();
  },
};

export const deepMerge = <T extends object>(target: T, source: T): T => {
  const isObject = (obj: any) => obj && typeof obj === 'object';
  if (!isObject(target) || !isObject(source)) {
    return source;
  }
  Object.keys(source).forEach((key) => {
    // @ts-ignore
    const targetValue = target[key];
    // @ts-ignore
    const sourceValue = source[key];
    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      // @ts-ignore
      target[key] = targetValue.concat(sourceValue);
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      // @ts-ignore
      target[key] = deepMerge(Object.assign({}, targetValue), sourceValue);
    } else {
      // @ts-ignore
      target[key] = sourceValue;
    }
  });
  return target;
};
