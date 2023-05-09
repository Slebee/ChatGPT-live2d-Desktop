import { appSettingState } from '@/stores/setting';

export class Vits {
  static audio = new Audio();

  static speak({
    id = 0,
    text,
    noise = 0.2,
    length = 1.2,
    beforeStart,
    afterEnd,
  }: {
    text: string;
    id?: number;
    noise?: number;
    length?: number;
    beforeStart?: () => void;
    afterEnd?: () => void;
  }) {
    this.audio.pause();

    // 移除消息文本中括号包裹的内容，出现多组的时候清除各自组内的内容，包括圆角和半角的情况
    const msg = text
      .replaceAll(/\(.*?\)/g, '')
      .replaceAll(/\（.*?\）/g, '')
      .replaceAll(/\(.*?\）/g, '')
      .replaceAll(/\（.*?\)/g, '')
      .replaceAll(/\{.*?\}/g, '')
      .replaceAll(/\｛.*?\｝/g, '')
      .replaceAll(/\{.*?\｝/g, '')
      .replaceAll(/\｛.*?\}/g, '');
    this.audio.src = `${appSettingState.vits?.basePath}/voice?text=${msg}&id=${id}&noise=${noise}&length=${length}`;
    // 等待音频加载完毕
    this.audio.onloadedmetadata = () => {
      // 播放音频
      this.audio.play();
      beforeStart?.();
    };
    this.audio.onended = () => {
      afterEnd?.();
    };
  }
}
