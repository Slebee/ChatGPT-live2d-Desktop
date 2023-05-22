import { Vits } from '@/object/tts/Vits';
import { RobotId, useRobot } from '../stores/robots';
import { useEffect, useRef, useState } from 'react';
import { useChat } from '../stores/chats';
import { emit, listen } from '@tauri-apps/api/event';
import { Events } from '@/enum/events';

export enum VitsStatusEnum {
  idle = 'idle',
  waiting = 'waiting',
  playing = 'playing',
}
export const useVits = (robotId: RobotId) => {
  const [status, setStatus] = useState<VitsStatusEnum>(VitsStatusEnum.idle);
  const [runningTimestamp, setRunningTimestamp] = useState<number | null>(null);
  const vitsRef = useRef<Vits>(
    new Vits({
      onAudioGenerateStart() {
        setStatus(VitsStatusEnum.waiting);
      },
      async beforeStart(text) {
        // 从value文本中获取{}包裹的文字，作为mood
        setStatus(VitsStatusEnum.playing);
        const mood = text?.match(/{(.*)}/)?.[1] ?? '';
        await emit('robotPlayAudioStart', { message: text, mood });
      },
      async afterEnd() {
        await emit('robotPlayAudioEnd');
        setStatus(VitsStatusEnum.idle);
      },
      afterStop() {
        setStatus(VitsStatusEnum.idle);
      },
    }),
  );
  const robot = useRobot(robotId);
  const [messages] = useChat(robotId);
  useEffect(() => {
    if (robot && robot.vits?.enabled) {
      vitsRef.current.setLength(robot.vits?.length!);
      vitsRef.current.setNoise(robot.vits?.noise!);
      vitsRef.current.setSpeakerId(robot.vits?.speaker?.id!);
    }
  }, [robot]);

  useEffect(() => {
    let unListen: () => void;
    async function listenCurrentRobotChanged() {
      unListen = await listen(Events.currentRobotChanged, () => {
        vitsRef.current.stop();
      });
    }
    listenCurrentRobotChanged();
    return () => {
      unListen?.();
    };
  }, []);
  return {
    currentTimestamp: runningTimestamp,
    status,
    playMessageByTimestamp: (timestamp: number, text?: string) => {
      const message = messages.find((m) => m.timestamp === timestamp);
      const content = text || message?.content || '';
      setRunningTimestamp(timestamp);
      vitsRef.current.stop();
      vitsRef.current.setText(content);
      vitsRef.current.speak({
        translate: robot?.baiduTranslate?.enabled,
        from: robot?.baiduTranslate?.from,
        to: robot?.baiduTranslate?.to,
      });
    },
    stop: () => {
      vitsRef.current.stop();
    },
  };
};
