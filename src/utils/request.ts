import axios from 'axios';
// @ts-ignore
import axiosTauriApiAdapter from 'axios-tauri-api-adapter';
export const request = axios.create({
  adapter: axiosTauriApiAdapter,
  timeout: 1200000,
});
