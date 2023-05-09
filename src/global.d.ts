import { Cubism2Spec, CubismSpec } from 'pixi-live2d-display';

export type CommonModelJSON = (CubismSpec.ModelJSON | Cubism2Spec.ModelJSON) & {
  url?: string;
};

declare global {
  const __BUILD_TIME__: number;

  function setInterval(
    handler: TimerHandler,
    timeout?: number,
    ...arguments: any[]
  ): number;
}
