import { defineConfig } from 'umi';

export default defineConfig({
  routes: [
    { path: '/', component: 'chat' },
    { path: '/chat', component: 'chat' },
    { path: '/live2d', component: 'live2d' },
  ],

  headScripts: ['/live2d.min.js', '/live2dcubismcore.min.js'],
  npmClient: 'pnpm',
  tailwindcss: {},
  plugins: ['@umijs/plugins/dist/tailwindcss', '@umijs/plugins/dist/locale'],
  locale: {
    // 默认使用 src/locales/zh-CN.ts 作为多语言文件
    default: 'en-US',
    baseSeparator: '-',
  },
});
