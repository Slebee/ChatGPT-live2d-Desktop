export enum DelayUnit {
  second = 'second',
  minute = 'minute',
  hour = 'hour',
}
export class Mission {
  private name: string;
  private description: string;
  impl: () => void;

  timer?: NodeJS.Timeout;

  times: number = 1;

  // 间隔
  delay?: number;

  // 间隔单位
  delayUnit?: DelayUnit;

  constructor({
    name,
    description,
    impl,
    times,
    delay,
    delayUnit,
  }: {
    name: string;
    description: string;
    impl: () => void;
    delay?: number;
    delayUnit?: DelayUnit;
    times?: number;
  }) {
    this.name = name;
    this.description = description;
    this.impl = impl;
    this.delay = delay;
    this.delayUnit = delayUnit;
    this.times = times || 1;
    this.startMission();
  }

  stopMission() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  startMission() {
    if (this.delay && this.delayUnit) {
      this.timer = setInterval(() => {
        if (this.times > 0) {
          this.impl();
          this.times--;
        } else {
          this.stopMission();
        }
      }, this.getDelay());
    } else {
      this.impl();
    }
  }

  getName() {
    return this.name;
  }

  getDelay() {
    if (!this.delay || !this.delayUnit) {
      throw new Error('Delay or delayUnit is not set');
    }
    if (this.delayUnit === 'second') {
      return this.delay * 1000;
    } else if (this.delayUnit === 'minute') {
      return this.delay * 1000 * 60;
    } else if (this.delayUnit === 'hour') {
      return this.delay * 1000 * 60 * 60;
    }
  }

  getDescription() {
    return this.description;
  }
}
