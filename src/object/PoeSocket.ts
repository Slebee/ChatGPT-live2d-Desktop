import { appSettingState } from '@/stores/setting';
import { Child, Command } from '@tauri-apps/api/shell';
// @ts-ignore
import { Socket, io } from 'socket.io-client';

type MessageResponse = {
  status: string;
  response: {
    text: string;
    bot_model: string;
    message_id: number;
  };
};
export type SendMessageParams = {
  bot_model: string;
  message: string;
  with_chat_break: boolean;
  message_id: number;
};
export type ResponseEvent = (response: MessageResponse) => void;
export enum MessageDoneEventStatusEnum {
  success = 'success',
  fail = 'fail',
}
export type MessageDoneEvent = (response: {
  status: MessageDoneEventStatusEnum;
  message: string;
  messageId: number;
}) => void;
const DEFAULT_TIMEOUT = 30000;
export class PoeSocket {
  static socket: Socket;
  static events: ResponseEvent[] = [];
  static onMessageResponseDoneEvents: MessageDoneEvent[] = [];

  static poeServerChild: Child;

  // 定时器队列，用于存储每条用户消息发出之后的定时器，来控制消息发送超时中断
  static timerQueue: Record<number, NodeJS.Timeout> = {};

  static async connect(options?: {
    onConnect?: () => void;
    onDisconnect?: () => void;
    onFail?: () => void;
  }) {
    if (!appSettingState.poe.proxy) {
      throw new Error('Poe: 未设置代理');
    }
    if (!appSettingState.poe.pb) {
      throw new Error('Poe: 未设置pb');
    }
    const port = appSettingState.poe.basePath?.split(':')[2];
    if (!port) {
      throw new Error('Poe: 未设置端口');
    }

    const command = Command.sidecar(
      'PoeApp',
      [
        '--proxy',
        appSettingState.poe.proxy,
        '--token',
        appSettingState.poe.pb,
        '--port',
        port,
      ],
      {
        encoding: 'gbk',
      },
    )
      .on('close', (code) => {
        console.log('on close', code);
        options?.onFail?.();
      })
      .on('error', (err) => {
        console.log('on error', err);
      });
    command.stdout.on('data', (line) => {
      console.log(`command stdout: "${line}"`);
      options?.onFail?.();
    });
    command.stderr.on('data', (line) =>
      console.log(`command stderr: "${line}"`),
    );
    console.log('start command spawn');
    PoeSocket.poeServerChild = await command.spawn();
    console.log('end command spawn');

    PoeSocket.socket = io(
      appSettingState.poe.basePath
        ?.replaceAll('http:', 'ws:')
        .replaceAll('https:', 'wss:'),
      {
        reconnectionDelayMax: 10000,
        transports: ['websocket'],
        path: '/ws/socket.io',
      },
    )
      .on('connect', () => {
        options?.onConnect?.();
        console.log('connected');
      })
      .on('disconnect', () => {
        options?.onDisconnect?.();
        console.log('disconnect');
      })
      .on('message_response', (data: MessageResponse) => {
        console.log('message_response', data);
        PoeSocket.events.forEach((event) => {
          event(data);
        });
      });
  }

  static addResponseEvent(ev: ResponseEvent) {
    PoeSocket.events.push(ev);
  }

  static removeResponseEvent(ev: ResponseEvent) {
    PoeSocket.events = PoeSocket.events.filter((e) => e !== ev);
  }

  static addMessageDoneEvent(ev: MessageDoneEvent) {
    PoeSocket.onMessageResponseDoneEvents.push(ev);
  }

  static removeMessageDoneEvent(ev: MessageDoneEvent) {
    PoeSocket.onMessageResponseDoneEvents =
      PoeSocket.onMessageResponseDoneEvents.filter((e) => e !== ev);
  }

  static sendMessage(params: SendMessageParams) {
    if (!PoeSocket.socket) {
      PoeSocket.onMessageResponseDoneEvents.forEach((ev) => {
        ev({
          status: MessageDoneEventStatusEnum.fail,
          message: '服务未连接',
          messageId: params.message_id,
        });
      });
      throw new Error('服务未连接');
    }
    let done = false;
    // 启动定时器，如果超时则中断消息发送
    // 简单判断30秒之后该消息还没有收到回复，则中断消息发送
    PoeSocket.timerQueue[params.message_id] = setTimeout(() => {
      if (!done) {
        PoeSocket.onMessageResponseDoneEvents.forEach((ev) => {
          ev({
            status: MessageDoneEventStatusEnum.fail,
            message: `timeout in ${DEFAULT_TIMEOUT}ms`,
            messageId: params.message_id,
          });
        });
      }
    }, DEFAULT_TIMEOUT);

    PoeSocket.socket.emit('send_message', params, (res: string) => {
      // 如果超时了，就不执行下面的逻辑
      if (done) {
        return false;
      }
      done = true;
      let status = res.split(' ')[1] as MessageDoneEventStatusEnum;
      let messageId = Number(res.split(' ')[0]);
      PoeSocket.onMessageResponseDoneEvents.forEach((ev) => {
        ev({
          status: [
            MessageDoneEventStatusEnum.success,
            MessageDoneEventStatusEnum.fail,
          ].includes(status)
            ? (status as MessageDoneEventStatusEnum)
            : MessageDoneEventStatusEnum.fail,
          message: res,
          messageId,
        });
      });
    });
  }

  static disconnect() {
    PoeSocket.socket.disconnect();
    PoeSocket.poeServerChild?.kill?.();
  }
}
