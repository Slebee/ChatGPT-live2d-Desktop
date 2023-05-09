import { useEffect, useRef, useState } from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { Space } from 'antd';
import { listen } from '@tauri-apps/api/event';
import { toggleWindowVisible } from '@/utils';
import NavIcon from '@/components/NavIcon';
import {
  CloseCircleOutlined,
  GatewayOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { App } from './object/App';
import TextTyper from './components/TextTyper';
import { MissionManager } from '@/object/missions/MissionManager';
import { Vits } from '@/object/tts/Vits';
import { ExtendedFileList } from 'pixi-live2d-display';
import { uploadFiles } from '@/object/model/upload';
import { isDraggingFile, readFiles } from '@/utils/file';
import { Background } from '@/object/model/tools/Background';
// const PIXI = require('pixi.js');
// const { Live2DModel } = require('pixi-live2d-display');
// const modelURL = '/localModels/fangcao/fangcao.model3.json';
// const modelURL = '/localModels/av_vts/av.model3.json';
const modelURL = '/localModels/cs/草神.model3.json';
// const modelURL = '/model/black_cat/hijiki.model.json';
// const modelURL = '/model/nanaqi/nanaqi.model3.json';
// const modelURL = ('https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/Live2D/Senko_Normals/senko.model3.json');
export default function Live2d() {
  const [resizeAble, setResizeAble] = useState(false);
  const MissionManagerRef = useRef<MissionManager | null>(null);
  const [text, setText] = useState('');
  const [modelLoaded, setModelLoaded] = useState(false);
  const draggableRef = useRef<HTMLCanvasElement>(null);
  const toggleResizeAble = () => {
    setResizeAble((resizeAble) => {
      const nextResizeAble = !resizeAble;
      appWindow.setResizable(nextResizeAble);
      if (nextResizeAble) {
        draggableRef.current &&
          draggableRef.current.removeAttribute('data-tauri-drag-region');
        App.currentModel?.setDraggable(true);
      } else {
        draggableRef.current &&
          draggableRef.current.setAttribute('data-tauri-drag-region', '');
        App.currentModel?.setDraggable(false);
      }
      return nextResizeAble;
    });
  };

  useEffect(() => {
    if (!App.pixiApp) {
      App.init('canvas');
      // App.addModel(modelURL);
    }
    MissionManagerRef.current = new MissionManager();
    // MissionManagerRef.current.addMission(
    //   new Mission({
    //     name: 'test',
    //     description: 'test mission',
    //     delay: 20,
    //     delayUnit: DelayUnit.second,
    //     // times:1,
    //     impl: async () => {
    //       // robotsActions.getCurrentRobot();
    //       const value = await askGpt([
    //         {
    //           role: 'system',
    //           content: `请用温柔的语气提醒我现在是${new Date().toLocaleString()},并问我想要做些什么`,
    //         },
    //       ]);
    //       TTS?.speak(value!, {
    //         onStart: () => {
    //           playModelSpeak();
    //           setText(value!);
    //         },
    //         onEnd: stopModelSpeak,
    //       });
    //     },
    //   }),
    // );
    let unListenRobotPlayAudioStart: () => void;
    let unListenRobotPlayAudioEnd: () => void;
    let unListenResize: () => void;
    async function initEvents() {
      unListenRobotPlayAudioStart = await listen<{
        message: string;
        mood: string;
      }>('robotPlayAudioStart', (e) => {
        App.currentModel?.setExpression(e.payload.mood);
        setText(e.payload.message);
        App.currentModel?.startSpeakMotion();
      });
      unListenRobotPlayAudioEnd = await listen<{
        message: string;
      }>('robotPlayAudioEnd', () => {
        App.currentModel?.stopSpeakMotion();
        App.currentModel?.resetExpression();
      });
      unListenResize = await appWindow.onResized(({ payload: size }) => {
        console.log('Window resized', size);
      });
    }
    initEvents();

    document.body.style.cssText = 'background: transparent !important';
    document.documentElement.style.cssText =
      'background: transparent !important';
    return () => {
      unListenRobotPlayAudioStart();
      unListenRobotPlayAudioEnd();
      unListenResize?.();
    };
  }, []);

  async function uploadModel(files: File[]) {
    try {
      const settingsArray = await uploadFiles(files);
      if (settingsArray.length) {
        for (const settings of settingsArray) {
          const fileList = files.slice() as ExtendedFileList;
          fileList.settings = settings;
          App.addModel(fileList);
        }
      } else {
        App.addModel(files);
      }
      setModelLoaded(true);
    } catch (e) {
      (e as Error).message = 'Failed to load model: ' + (e as Error).message;
      console.error(e);
    }
  }
  async function drop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    console.log(e);
    if (e.dataTransfer?.items.length) {
      const files = await readFiles(e.dataTransfer.items);
      if (files.length === 1 && files[0].type.includes('image')) {
        Background.set(files[0]).catch(console.error);
      } else {
        uploadModel(files).then();
      }
    }
  }
  const dndEvents = {
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
      if (isDraggingFile(e)) {
        e.preventDefault();
      }
    },
    onDrop: (e: React.DragEvent<HTMLDivElement>) => drop(e),
  };

  return (
    <div
      className={`w-full h-full ${
        resizeAble ? 'border-2 border-indigo-500/50' : ''
      } ${modelLoaded ? 'bg-transparent' : 'bg-gray-100'}`}
      {...dndEvents}
    >
      <canvas
        id="canvas"
        data-tauri-drag-region
        ref={draggableRef}
        className="bg-transparent"
      />
      {text && (
        <div
          className="absolute inset-x-0 w-40 bg-orange-100 drop-shadow-md rounded-md p-2 text-orange-800 opacity-80"
          style={{
            width: 200,
            top: 15,
          }}
        >
          <TextTyper
            text={text}
            interval={100}
            onEnd={() => {
              setTimeout(() => {
                setText('');
              }, 1000);
            }}
          />
          {/* 小三角形 */}
          <div
            className="absolute bg-orange-100"
            style={{
              bottom: -5,
              right: 5,
              width: 15,
              height: 20,
              transform: 'rotate(115deg)',
            }}
          />
        </div>
      )}
      <div className="absolute right-2.5 top-2.5">
        <Space direction="vertical">
          <NavIcon
            icon={<CloseCircleOutlined />}
            onClick={() => {
              appWindow.hide();
            }}
          />
          <NavIcon
            icon={<MessageOutlined />}
            onClick={async () => {
              await toggleWindowVisible('chat');
            }}
          />
          <NavIcon icon={<GatewayOutlined />} onClick={toggleResizeAble} />
        </Space>
      </div>
    </div>
  );
}
