import { useSnapshot } from 'valtio';
import { proxyWithPersist } from '@/utils';
import { RobotId } from './robots';

export type ChatMessage = {
  timestamp: number;
  sender: 'user' | 'assistant' | 'system' | 'bot';
  // receiver: string;
  content: string;
  status: 'sending' | 'sent' | 'failed';
};

export type ChatHistory = {
  [robotId: string]: ChatMessage[];
};
const chatHistoryState = proxyWithPersist<ChatHistory>('chatHistory', {});

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
          if (m.timestamp === message.timestamp) {
            return {
              ...m,
              ...message,
            };
          }
          return m;
        });
      }
    },
    cleanMessages: () => {
      chatHistoryState[robotId] = chatHistoryState[robotId]
        .filter((item) => item.sender === 'system')
        .map((item) => ({ ...item, timestamp: new Date().getTime() }));
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
