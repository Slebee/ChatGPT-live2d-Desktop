import { useSnapshot } from 'valtio';
import { proxyWithPersist } from '@/utils/storage';
import { RobotId, robotsActions } from './robots';
import { clearContext } from '@/poe';
import { RobotType } from '@/enum/robot';

export type ChatMessage = {
  timestamp: number;
  sender: 'user' | 'assistant' | 'system' | 'bot';
  // receiver: string;
  content: string;
  status: 'sending' | 'sent' | 'failed' | 'writing';

  conversationId?: string;
};

export type ChatHistory = {
  [robotId: string]: ChatMessage[];
};
const chatHistoryState = await proxyWithPersist<ChatHistory>(
  'chatHistory',
  {},
  {
    onRead: (count, prevData) => {
      if (count === 1) {
        if (prevData !== null) {
          // 首次读取的时候，处理一下上次关闭程序没有处理完的消息
          Object.keys(prevData).forEach((robotId) => {
            prevData[robotId].forEach((message) => {
              if (message.status === 'sending') {
                message.status = 'failed';
                message.content = '发送失败';
              }
            });
          });
        }
      }
    },
  },
);

export const useChats = () => {
  const history = useSnapshot(chatHistoryState);
  return [history];
};
export const useChat = (robotId: RobotId) => {
  const history = useSnapshot(chatHistoryState);
  return [history[robotId] || []];
};

export const chatActionsFactory = (robotId: string | number) => {
  return {
    addMessage: (message: ChatMessage) => {
      if (!chatHistoryState[robotId]) {
        chatHistoryState[robotId] = [];
      }
      chatHistoryState[robotId].push(message);
    },
    removeMessage: (message: ChatMessage) => {
      if (chatHistoryState[robotId]) {
        chatHistoryState[robotId] = chatHistoryState[robotId].filter(
          (m) => m.timestamp !== message.timestamp,
        );
      }
    },
    removeAllMessages: () => {
      chatHistoryState[robotId] = [];
    },
    updateMessage: (message: Partial<ChatMessage>) => {
      if (chatHistoryState[robotId]) {
        chatHistoryState[robotId] = chatHistoryState[robotId].map((m) => {
          if (m.timestamp == message.timestamp) {
            return {
              ...m,
              ...message,
            };
          }
          return m;
        });
      }
    },
    reduceMessage: ({
      incrementalText,
      timestamp,
      status,
    }: {
      incrementalText: string;
      timestamp: ChatMessage['timestamp'];
      status?: ChatMessage['status'];
    }) => {
      if (chatHistoryState[robotId]) {
        chatHistoryState[robotId] = chatHistoryState[robotId].map((m) => {
          if (m.timestamp == timestamp) {
            return {
              ...m,
              status: status || m.status,
              content: m.content + incrementalText,
            };
          }
          return m;
        });
      }
    },
    cleanMessages: async () => {
      const bot = robotsActions.getRobotById(robotId);
      if (!bot)
        return {
          status: 'failed',
          message: '机器人不存在',
        };
      const _clean = () => {
        chatHistoryState[robotId] = chatHistoryState[robotId]
          .filter((item) => item.sender === 'system')
          .map((item) => ({ ...item, timestamp: new Date().getTime() }));
      };
      if (bot.isPoeBot) {
        if (bot.hasClearContext) {
          try {
            const res = await clearContext(bot.model);
            if (res.data.status === 'success') {
              _clean();
              return {
                status: 'success',
                message: '已清除聊天记录',
                error: '',
              };
            }
            throw new Error('清除失败');
          } catch (err: any) {
            return {
              status: 'failed',
              message: err.message,
            };
          }
        }
        _clean();
        return {
          status: 'confirm',
          message: '该机器人不支持清除服务器上下文，是否清除本地聊天记录？',
          clean: _clean,
        };
      }
      if (bot?.type === RobotType.GPT) {
        _clean();
        return {
          status: 'success',
          message: '已清除聊天记录',
          error: '',
        };
      }
      if (bot?.type === RobotType.CLAUDE) {
        return {
          status: 'confirm',
          message:
            '清除Claude服务器上下文,请手动输入/reset指令,是否清除本地聊天记录',
          clean: _clean,
        };
      }
      _clean();
      return {
        status: 'success',
        message: '已清除本地聊天记录',
        error: '',
      };
    },
    deleteAssistantMessage: (timestamp: ChatMessage['timestamp']) => {
      if (chatHistoryState[robotId]) {
        // 删除当前信息与上一条user的信息
        const index = chatHistoryState[robotId].findIndex(
          (item) => item.timestamp === timestamp,
        );
        if (index > 0) {
          chatHistoryState[robotId].splice(index - 1, 2);
        }
      }
    },
    updateSystemMessage: (message: Partial<ChatMessage>) => {
      if (chatHistoryState[robotId]) {
        chatHistoryState[robotId] = chatHistoryState[robotId].map((m) => {
          if (m.sender === 'system') {
            return {
              ...m,
              ...message,
            };
          }
          return m;
        });
      }
    },
  };
};
