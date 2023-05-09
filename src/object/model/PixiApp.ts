import { Filter } from '@/object/model/Filter';
import { Application } from '@pixi/app';
import { BatchRenderer, Renderer, extensions } from '@pixi/core';
import { Extract } from '@pixi/extract';
import { InteractionManager } from '@pixi/interaction';
import { TickerPlugin } from '@pixi/ticker';
// @ts-ignore
import Stats from 'stats.js';

extensions.add(TickerPlugin, Extract, BatchRenderer, InteractionManager);

export class PixiApp extends Application {
  declare renderer: Renderer;

  constructor({ stats, canvasId }: { stats?: Stats; canvasId: string }) {
    super({
      view: document.getElementById(canvasId) as HTMLCanvasElement,
      resizeTo: window,
      antialias: true,
      backgroundAlpha: 0,
    });

    this.ticker.remove(this.render, this);

    this.ticker.add(() => {
      if (stats) {
        stats.begin();
      }

      Filter.update(this.ticker.deltaMS);

      this.render();
      if (stats) {
        stats.end();
      }
    });
  }
}
