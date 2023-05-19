import { Events } from '@/enum/events';
import { Vits } from '@/object/tts/Vits';
import Icon, {
  LoadingOutlined,
  PlayCircleOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import { emit, listen } from '@tauri-apps/api/event';
import { App } from 'antd';
import { useState, forwardRef, useRef, useEffect } from 'react';

type PlayVoiceType = {
  text?: string;
  length?: number;
  noise?: number;
  speakerId?: number;
};
type VoiceIconProps = PlayVoiceType & {
  showUI?: boolean;
  autoPlayOnMount?: boolean;
  timestamp?: number;
  translateEnabled: boolean;
};
export type VoiceIconRef = {
  play: (params: PlayVoiceType) => void;
};
const VoiceIcon = forwardRef((props: VoiceIconProps, ref) => {
  const speakerRef = useRef<Vits>(
    new Vits({
      text: props.text,
      length: props.length,
      noise: props.noise,
      id: props.speakerId,
      onAudioGenerateStart() {
        setStatus('waiting');
      },
      async beforeStart(text) {
        // 从value文本中获取{}包裹的文字，作为mood
        setStatus('playing');
        const mood = text?.match(/{(.*)}/)?.[1] ?? '';
        await emit('robotPlayAudioStart', { message: text, mood });
      },
      async afterEnd() {
        await emit('robotPlayAudioEnd');
        setStatus('idle');
      },
      afterStop() {
        setStatus('idle');
      },
    }),
  );
  const { message } = App.useApp();
  const { showUI = true } = props;
  const [status, setStatus] = useState<'idle' | 'waiting' | 'playing'>('idle');
  const play = (params: PlayVoiceType) => {
    if (typeof params.speakerId === 'undefined' || params.speakerId === null) {
      message.warning('未选择角色声音');
      return false;
    }
    if (!params.text) {
      message.warning('未输入文字');
      return false;
    }
    speakerRef.current
      ?.speak({ translate: props.translateEnabled })
      .catch((e) => {
        message.error(e.message);
      });
  };

  useEffect(() => {
    if (props.speakerId || props.speakerId === 0) {
      speakerRef.current.setSpeakerId(props.speakerId);
    }
  }, [props.speakerId]);

  useEffect(() => {
    if (props.text) {
      speakerRef.current.setText(props.text);
    }
  }, [props.text]);

  useEffect(() => {
    if (props.length) {
      speakerRef.current.setLength(props.length);
    }
  }, [props.length]);

  useEffect(() => {
    if (props.noise) {
      speakerRef.current.setNoise(props.noise);
    }
  }, [props.noise]);

  useEffect(() => {
    let unlisten: () => void;
    async function init() {
      unlisten = await listen<{
        timestamp: number;
      }>(Events.addNewReplyMessage, ({ payload: { timestamp } }) => {
        if (timestamp === props.timestamp) {
          speakerRef.current
            ?.speak({ translate: props.translateEnabled })
            .catch((e) => {
              message.error(e.message);
            });
        }
      });
    }
    init();
    return () => {
      unlisten();
    };
  }, []);
  if (!showUI) return null;
  if (status === 'waiting') {
    return (
      <LoadingOutlined className="absolute w-5 text-lg right-[-25px] top-[7px] cursor-pointer text-gray-400 hover:text-gray-500 transition-colors" />
    );
  }
  if (status === 'playing') {
    return (
      <div
        className="absolute voice-icon-container h-3 right-[-35px] top-[8px] cursor-pointer"
        onClick={async () => {
          await speakerRef.current.stop();
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="voice-icon-bar" />
        ))}
      </div>
    );
  }
  return (
    <PlayCircleOutlined
      onClick={() => {
        play(props);
      }}
      className="absolute w-5 text-lg right-[-25px] top-[7px] cursor-pointer text-gray-400 hover:text-gray-500 transition-colors"
    />
  );
});
export default VoiceIcon;
