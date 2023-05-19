import { appSettingState } from '@/stores/setting';
import { BaiduTranslator } from '../translator/BaiduTranslator';

export class Vits {
  static runningInstance: Vits | null = null;
  private audio: HTMLAudioElement;
  private noise;
  private length;
  private text;
  private id;

  public beforeStart?: (text: string) => void;
  public onAudioGenerateStart?: () => void;
  public afterEnd?: () => void;
  public afterStop?: () => void;

  constructor({
    id = 0,
    text,
    noise = 0.2,
    length = 1.2,
    beforeStart,
    onAudioGenerateStart,
    afterEnd,
    afterStop,
  }: {
    text?: string;
    id?: number;
    noise?: number;
    length?: number;
    onAudioGenerateStart?: () => void;
    beforeStart?: (text: string) => void;
    afterEnd?: () => void;
    afterStop?: () => void;
  }) {
    this.noise = noise;
    this.length = length;
    this.text = text ?? '';
    this.id = id;
    this.beforeStart = beforeStart;
    this.onAudioGenerateStart = onAudioGenerateStart;
    this.afterEnd = afterEnd;
    this.afterStop = afterStop;
    this.audio = new Audio();
  }

  static getRunningInstance() {
    return Vits.runningInstance;
  }
  static setRunningInstance(t: Vits) {
    Vits.runningInstance = t;
  }
  static clearRunningInstance() {
    if (Vits.getRunningInstance()) {
      Vits.runningInstance!.stop();
      Vits.runningInstance = null;
    }
  }

  stop() {
    this.audio.pause();
    this.audio.onloadedmetadata = () => {};
    this.audio.onended = () => {};
    this.afterStop?.();
    return Promise.resolve();
  }

  setNoise(noise: number) {
    this.noise = noise;
  }

  setLength(length: number) {
    this.length = length;
  }

  setSpeakerId(id: number) {
    this.id = id;
  }

  setText(text: string) {
    this.text = text;
  }

  async speak({ translate = false }) {
    if (Vits.getRunningInstance() !== this) {
      Vits.clearRunningInstance();
      Vits.setRunningInstance(this);
    } else {
      this.stop();
    }
    // 移除消息文本中括号包裹的内容，出现多组的时候清除各自组内的内容，包括圆角和半角的情况
    let msg = this.text
      .replaceAll(/\(.*?\)/g, '')
      .replaceAll(/\（.*?\）/g, '')
      .replaceAll(/\(.*?\）/g, '')
      .replaceAll(/\（.*?\)/g, '')
      .replaceAll(/\{.*?\}/g, '')
      .replaceAll(/\｛.*?\｝/g, '')
      .replaceAll(/\{.*?\｝/g, '')
      .replaceAll(/\｛.*?\}/g, '');
    this.onAudioGenerateStart?.();

    if (translate) {
      if (!appSettingState.baiduTranslate.appid)
        throw new Error('请先设置百度翻译的appid');
      if (!appSettingState.baiduTranslate.key)
        throw new Error('请先设置百度翻译的key');

      const baiduTranslator = new BaiduTranslator({
        q: msg,
        from: 'zh',
        to: 'jp',
        appid: appSettingState.baiduTranslate.appid,
        key: appSettingState.baiduTranslate.key,
      });
      try {
        msg = (await baiduTranslator.translate()) ?? msg;
      } catch (e: any) {
        this.stop();
        throw new Error(`翻译失败:${e.message}`);
      }
    }
    this.audio.src = `${appSettingState.vits?.basePath}/voice?text=${msg}&id=${this.id}&noise=${this.noise}&length=${this.length}`;
    // 等待音频加载完毕
    this.audio.onloadedmetadata = () => {
      // 播放音频
      this.audio.play();
      this.beforeStart?.(this.text);
    };
    this.audio.onended = () => {
      this.afterEnd?.();
    };
  }
}
