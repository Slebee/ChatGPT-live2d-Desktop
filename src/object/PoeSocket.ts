import { PoeServerStatusEnum, robotsActions } from '@/pages/chat/stores/robots';
import { appSettingState } from '@/stores/setting';
import { Child, Command } from '@tauri-apps/api/shell';
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
  static socket: Socket | null;
  static poeCommander: Child;
  static events: ResponseEvent[] = [];
  static onMessageResponseDoneEvents: MessageDoneEvent[] = [];

  static poeServerChild: Child;

  // 定时器队列，用于存储每条用户消息发出之后的定时器，来控制消息发送超时中断
  static timerQueue: Record<number, NodeJS.Timeout> = {};

  static async connect(options?: { onConnected?: () => void }) {
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
    await new Command('taskkill', ['/f', '/im', 'PoeApp.exe'], {
      encoding: 'gbk',
    }).execute();
    if (PoeSocket.socket) {
      PoeSocket.socket.disconnect();
      PoeSocket.socket = null;
    }
    robotsActions.updatePoeServer(PoeServerStatusEnum.Connecting);

    const onConnect = () => {
      robotsActions.updatePoeServer(PoeServerStatusEnum.Connected);
      options?.onConnected?.();
    };
    const onFail = (err: string) => {
      robotsActions.updatePoeServer(PoeServerStatusEnum.Failure, err);
    };
    const onPoeServerStarted = () => {
      PoeSocket.socket = io(
        appSettingState.poe.basePath
          ?.replaceAll('http:', 'ws:')!
          .replaceAll('https:', 'wss:')!,
        {
          reconnectionDelayMax: 10000,
          transports: ['websocket'],
          path: '/ws/socket.io',
        },
      )
        .on('connect', () => {
          onConnect();
          console.log('connected');
        })
        .on('disconnect', () => {
          onFail('断开连接');
          console.log('disconnect');
        })
        .on('message_response', (data: MessageResponse) => {
          console.log('message_response', data);
          PoeSocket.events.forEach((event) => {
            event(data);
          });
        });
    };

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
    ).on('error', (err) => {
      console.log('on error', err);
      onFail(err);
    });
    const onCommandStdout = (line: string) => {
      console.log(`command stdout: "${line}"`);
      if (line.indexOf('Application startup complete') > -1) {
        onPoeServerStarted();
      }
      if (
        line.indexOf('failed to do request') > -1 &&
        line.indexOf('stream error') === -1 &&
        line.indexOf('websocket') === -1
      ) {
        onFail(line);
      }
      if (
        line.indexOf('Failed to download https://poe.com too many times.') > -1
      ) {
        onFail(line);
      }
      if (line.indexOf('ERROR') > -1 && line.indexOf('goodbye') === -1) {
        onFail(line);
      }
    };
    command.stdout.on('data', (line) => {
      onCommandStdout(line);
    });
    command.stderr.on('data', (line) => {
      onCommandStdout(line);
    });
    console.log('start command spawn');
    PoeSocket.poeServerChild = await command.spawn();
    console.log('end command spawn');
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
}
