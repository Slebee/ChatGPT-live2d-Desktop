import * as PIXI from 'pixi.js';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/atom-one-dark.css';
import 'allotment/dist/style.css';
import 'react-contexify/ReactContexify.css';
import { appSettingState } from './stores/setting';
import { darkMode } from './utils';
import { App } from '@/object/model/App';

// 将 PIXI 暴露到 window 上，这样插件就可以通过 window.PIXI.Ticker 来自动更新模型
PIXI.settings.PREFER_ENV = PIXI.ENV.WEBGL_LEGACY;
//@ts-ignore
window.PIXI = PIXI;
(window as any).App = App;
if (appSettingState.theme === 'dark') {
  darkMode.enable();
} else {
  darkMode.disable();
}
