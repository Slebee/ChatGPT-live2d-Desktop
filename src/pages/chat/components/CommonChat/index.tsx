import Search from './components/Search';
import { GptMessageItem } from '@/gpt';
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
import { emit } from '@tauri-apps/api/event';
import { Vits } from '@/object/tts/Vits';

export type CommonChatProps = {
  className?: string;
  robot: Robot;
};

const CommonChat = ({ className, robot }: CommonChatProps) => {
  const [messages] = useChat(robot.id);
  const firstTimeFocusCurrentRobot = useRef(true);
  const [setting] = useAppSetting();
  const chatActions = useMemo(() => chatActionsFactory(robot.id), [robot.id]);
  const { currentRobotId } = useRobots();
  const chatContainerRef = useRef<ChatContainerRef>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const systemMessage: ChatMessage = {
      content: robot.description,
      timestamp: new Date().getTime(),
      sender: 'system',
      status: 'sent',
    };
    if (messages.length === 0) {
      chatActions.addMessage(systemMessage);
    }
  }, [robot.description]);
  const scrollToBottom = () => {
    chatContainerRef.current?.scrollToBottom();
  };

  useEffect(() => {
    if (currentRobotId === robot.id && firstTimeFocusCurrentRobot.current) {
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
        status: 'sending',
      });
    }
    try {
      setLoading(true);
      const _messages = [...messages, questionMessage].filter(
        (message) => message.sender !== 'bot' && message.status === 'sent',
      );
      // 只取最后的historySize条
      const historySize = setting.openAI.historySize!;
      const history = _messages.slice(-historySize);
      if (_messages[0].sender === 'system' && history[0].sender !== 'system') {
        history.unshift(_messages[0]);
      }
      const value = await ask({
        platform: robot.type,
        messages: history,
        robot,
      });
      console.log(value);
      // const value = await askGpt(_messages);
      // const value = "Sorry, I don't know.";
      chatActions.updateMessage({
        content: value.text,
        timestamp: assistantMessage.timestamp,
        conversationId: value.conversationId,
        status: 'sent',
      });
      setLoading(false);
      if (setting.vits.allowAudio) {
        Vits.speak({
          text: value.text ?? '出错了',
          length: robot.vits?.length,
          noise: robot.vits?.noise,
          id: robot.vits?.speaker?.id,
          async beforeStart() {
            // 从value文本中获取{}包裹的文字，作为mood
            const mood = value?.text?.match(/{(.*)}/)?.[1] ?? '';
            await emit('robotPlayAudioStart', { message: value, mood });
          },
          async afterEnd() {
            await emit('robotPlayAudioEnd');
          },
        });
      }
      scrollToBottom();
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
  return (
    <div className={`h-full flex ${className ?? ''}`}>
      <div className="h-full w-full flex flex-col">
        <ChatHeader />
        <div className="h-full flex-auto">
          <Allotment vertical defaultSizes={[500, 140]}>
            <Allotment.Pane priority={2}>
              <ChatContainer ref={chatContainerRef}>
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
                        robotAvatar={robot.avatar}
                        myAvatar={setting.basic.avatar}
                      />
                    );
                  })}
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
