import { ModelEntity } from '@/object/model/ModelEntity';
import { ExtendedFileList } from 'pixi-live2d-display';
import { PixiApp } from '@/object/model/PixiApp';
import { Live2DModel } from '@/object/model/Live2DModel';

export class App {
  static pixiApp: PixiApp;
  static currentModel: ModelEntity | null = null;

  static addModel(source: string | ExtendedFileList) {
    if (this.currentModel) {
      this.removeModel();
    }
    const model = new ModelEntity(source, this.pixiApp.renderer);
    this.initModel(model);
    this.currentModel = model;
  }

  static init(canvasId: string) {
    this.pixiApp = new PixiApp({
      canvasId,
    });
  }

  private static initModel(model: ModelEntity) {
    model.on('modelLoaded', async (pixiModel: Live2DModel) => {
      if (!this.pixiApp.stage.children.includes(pixiModel)) {
        this.pixiApp.stage.addChild(pixiModel);
        pixiModel.position.set(
          this.pixiApp.renderer.width / 2,
          this.pixiApp.renderer.height / 2,
        );

        model.fit(this.pixiApp.renderer.width, this.pixiApp.renderer.height);
        model.initThumbnail(this.pixiApp.renderer);
      }
    });
  }

  static autoResize() {
    this.currentModel?.pixiModel?.position.set(
      this.pixiApp.renderer.width / 2,
      this.pixiApp.renderer.height / 2,
    );
  }

  static removeModel() {
    if (this.currentModel?.pixiModel) {
      this.pixiApp.stage.removeChild(this.currentModel.pixiModel);
    }
    if (this.currentModel) {
      this.currentModel?.destroy();
    }
  }

  get currentModel() {
    if (!App.currentModel) throw new Error('No model loaded');
    return App.currentModel;
  }
}
