import Search from './components/Search';
import { ask } from '@/services';
import { useEffect, useMemo, useRef, useState } from 'react';
import ChatContainer, { ChatContainerRef } from './components/ChatContainer';
import { useAppSetting } from '@/stores/setting';
import Message from './components/Message';
// @ts-ignore
import { Allotment } from 'allotment';
import {
  ChatMessage,
  chatActionsFactory,
  useChat,
} from '@/pages/chat/stores/chats';
import ChatHeader from './components/ChatHeader';
import { Robot, useRobots } from '@/pages/chat/stores/robots';
import { VitsStatusEnum, useVits } from '../../hooks/useVits';
import { MessageDoneEvent, PoeSocket, ResponseEvent } from '@/object/PoeSocket';
import { RobotType } from '@/enum/robot';
import { App } from 'antd';

export type CommonChatProps = {
  className?: string;
  robot: Robot;
  tips?: React.ReactNode;
};

const CommonChat = ({ className, robot, tips }: CommonChatProps) => {
  const [messages] = useChat(robot.botId);
  const firstTimeFocusCurrentRobot = useRef(true);
  const { message } = App.useApp();
  const [setting] = useAppSetting();
  const chatActions = useMemo(
    () => chatActionsFactory(robot.botId),
    [robot.botId],
  );
  const { currentRobotId } = useRobots();
  const chatContainerRef = useRef<ChatContainerRef>(null);
  const [loading, setLoading] = useState(false);
  const { currentTimestamp, status, playMessageByTimestamp, stop } = useVits(
    robot.botId,
  );
  useEffect(() => {
    const systemMessage: ChatMessage = {
      content: robot.promptPlaintext || '',
      timestamp: new Date().getTime(),
      sender: 'system',
      status: 'sent',
    };
    if (
      messages.length === 0 &&
      robot.type === RobotType.GPT &&
      robot.promptPlaintext
    ) {
      chatActions.addMessage(systemMessage);
    }
  }, [robot.type, robot.promptPlaintext]);
  const scrollToBottom = () => {
    chatContainerRef.current?.scrollToBottom();
  };

  useEffect(() => {
    if (currentRobotId === robot.botId && firstTimeFocusCurrentRobot.current) {
      scrollToBottom();
      firstTimeFocusCurrentRobot.current = false;
    }
  }, [currentRobotId]);

  const sendMessage = async (
    questionMessage: ChatMessage,
    assistantMessage: ChatMessage,
    isRetry = false,
  ) => {
    if (isRetry) {
      chatActions.updateMessage({
        timestamp: assistantMessage.timestamp,
        content: '',
        status: 'sending',
      });
    }
    try {
      setLoading(true);
      const _messages = [...messages].filter(
        (message) => message.sender !== 'bot' && message.status === 'sent',
      );
      if (!_messages.find((m) => m.timestamp === questionMessage.timestamp)) {
        _messages.push(questionMessage);
      }
      // 只取最后的historySize条
      const historySize = setting.openAI.historySize!;
      const history = _messages.slice(-historySize);
      if (
        !_messages.find((m) => m.sender === 'system') &&
        !history.find((m) => m.sender === 'system')
      ) {
        history.unshift(_messages[0]);
      }

      if (robot.type === RobotType.POE && robot.streamed) {
        PoeSocket.sendMessage({
          bot_model: robot.model,
          message: history[history.length - 1].content,
          with_chat_break: false,
          message_id: assistantMessage.timestamp,
        });
      } else {
        const value = await ask({
          platform: robot.type,
          messages: history,
          robot,
        });
        // const value = await askGpt(_messages);
        // const value = "Sorry, I don't know.";
        chatActions.updateMessage({
          content: value.text,
          timestamp: assistantMessage.timestamp,
          conversationId: value.conversationId,
          status: 'sent',
        });
        if (robot.vits?.enabled) {
          playMessageByTimestamp(assistantMessage.timestamp, value.text);
        }
        setLoading(false);
        scrollToBottom();
      }
    } catch (err: any) {
      let errMsg = err.message || err;
      chatActions.updateMessage({
        content: errMsg,
        timestamp: assistantMessage.timestamp,
        status: 'failed',
        sender: 'assistant',
      });
      scrollToBottom();
      setLoading(false);
    }
  };
  const submit = async (question: string) => {
    const questionMessage: ChatMessage = {
      content: question,
      timestamp: new Date().getTime(),
      sender: 'user',
      status: 'sent',
    };
    chatActions.addMessage(questionMessage);
    const assistantMessage: ChatMessage = {
      content: '',
      timestamp: new Date().getTime() + 1,
      status: 'sending',
      sender: 'assistant',
    };
    chatActions.addMessage(assistantMessage);
    scrollToBottom();
    await sendMessage(questionMessage, assistantMessage);
  };

  useEffect(() => {
    const responseEvent: ResponseEvent = (d) => {
      if (d.response.bot_model === robot.model) {
        chatActions.reduceMessage({
          timestamp: d.response.message_id,
          incrementalText: d.response.text,
          status: d.status === 'success' ? 'writing' : 'failed',
        });
        scrollToBottom();
      }
    };
    const onDoneEvent: MessageDoneEvent = (d) => {
      // console.log(d);
      const data: Partial<ChatMessage> = {
        timestamp: d.messageId,
        status: d.status === 'success' ? 'sent' : 'failed',
      };
      if (d.message) {
        data.content = d.message;
      }
      chatActions.updateMessage({
        timestamp: d.messageId,
        status: d.status === 'success' ? 'sent' : 'failed',
      });
      setLoading(false);
    };
    if (robot.streamed) {
      PoeSocket.addResponseEvent(responseEvent);
      PoeSocket.addMessageDoneEvent(onDoneEvent);
    }
    return () => {
      PoeSocket.removeResponseEvent(responseEvent);
      PoeSocket.removeMessageDoneEvent(onDoneEvent);
    };
  }, []);
  return (
    <div className={`h-full flex ${className ?? ''}`}>
      <div className="h-full w-full flex flex-col">
        <ChatHeader />
        <div className="h-full flex-auto">
          <Allotment vertical defaultSizes={[500, 140]}>
            <Allotment.Pane priority={2}>
              <ChatContainer ref={chatContainerRef}>
                {tips}
                {messages
                  .filter(
                    (message) =>
                      message.sender === 'user' ||
                      message.sender === 'assistant' ||
                      message.sender === 'bot',
                  )
                  .map((message, index) => {
                    const isMe = message.sender === 'user';
                    return (
                      <Message
                        key={message.timestamp}
                        isMe={isMe}
                        onDelete={() =>
                          chatActions.deleteAssistantMessage(message.timestamp)
                        }
                        onRetry={() => {
                          sendMessage(messages[index - 1], message, true);
                        }}
                        status={message.status}
                        content={message.content}
                        timestamp={message.timestamp}
                        sender={message.sender}
                        robotId={robot.botId}
                        myAvatar={setting.basic.avatar}
                        audioStatus={
                          message.timestamp === currentTimestamp
                            ? status
                            : VitsStatusEnum.idle
                        }
                        onAudioPlay={() => {
                          playMessageByTimestamp(message.timestamp);
                        }}
                        onAudioPause={stop}
                      />
                    );
                  })}
                {robot.type === RobotType.POE &&
                  robot.isLimitedAccess &&
                  robot.messageLimit.shouldShowRemainingMessageCount && (
                    <div className="p-3 text-xs text-slate-500 text-center">
                      <p className="mb-2">
                        受poe限制,您今天还有
                        <span className="mr-1 text-rose-900 ml-1">
                          {robot.messageLimit.dailyBalance}
                        </span>
                        条免费信息。
                      </p>
                      <p>请到Poe官网订阅以支持Poe并发送更多信息。</p>
                    </div>
                  )}
                {robot.type === RobotType.POE}
              </ChatContainer>
            </Allotment.Pane>
            <Allotment.Pane minSize={140} ini priority={1}>
              <div className="h-full">
                <Search
                  loading={loading}
                  // onClose={hideChat}
                  onSubmit={submit}
                />
              </div>
            </Allotment.Pane>
          </Allotment>
        </div>
      </div>
    </div>
  );
};

export default CommonChat;
