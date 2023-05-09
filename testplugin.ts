import { IApi } from 'umi';

export default (api: IApi) => {
  api.modifyHTML(($) => {
    $('body').append([`<canvas id="live2d-model-setting"></canvas>`]);
    return $;
  });
};
