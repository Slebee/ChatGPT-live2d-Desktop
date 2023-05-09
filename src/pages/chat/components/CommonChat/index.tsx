import Search from './components/Search';
import { GptMessageItem, askGpt } from '@/gpt';
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

  useEffect(() => {
    if (currentRobotId === robot.id && firstTimeFocusCurrentRobot.current) {
      chatContainerRef.current?.scrollToBottom();
      firstTimeFocusCurrentRobot.current = false;
    }
  }, [currentRobotId]);

  const submit = async (question: string) => {
    const submitMessage: ChatMessage = {
      content: question,
      timestamp: new Date().getTime(),
      sender: 'user',
      status: 'sent',
    };
    chatActions.addMessage(submitMessage);
    chatContainerRef.current?.scrollToBottom();
    let timestamp = new Date().getTime() + 1;
    try {
      setLoading(true);
      chatActions.addMessage({
        content: '',
        timestamp,
        status: 'sending',
        sender: 'assistant',
      });
      const _messages: GptMessageItem[] = [...messages, submitMessage]
        .filter(
          (message) => message.sender !== 'bot' && message.status === 'sent',
        )
        .map((message) => {
          return {
            content: message.content,
            role: message.sender,
          };
        }) as GptMessageItem[];
      // 只取最后的historySize条
      const historySize = setting.openAI.historySize!;
      const history = _messages.slice(-historySize);
      if (_messages[0].role === 'system' && history[0].role !== 'system') {
        history.unshift(_messages[0]);
      }
      const value = await askGpt(history);
      // const value = await askGpt(_messages);
      // const value = "Sorry, I don't know.";
      chatActions.updateMessage({
        content: value,
        timestamp,
        status: 'sent',
      });
      setLoading(false);
      if (setting.vits.allowAudio) {
        Vits.speak({
          text: value ?? '出错了',
          length: robot.vits?.length,
          noise: robot.vits?.noise,
          id: robot.vits?.speaker?.id,
          async beforeStart() {
            // 从value文本中获取{}包裹的文字，作为mood
            const mood = value?.match(/{(.*)}/)?.[1] ?? '';
            await emit('robotPlayAudioStart', { message: value, mood });
          },
          async afterEnd() {
            await emit('robotPlayAudioEnd');
          },
        });
      }
      chatContainerRef.current?.scrollToBottom();
    } catch (err: any) {
      console.log(err);
      chatActions.updateMessage({
        content: err.message,
        timestamp,
        status: 'failed',
        sender: 'assistant',
      });
      chatContainerRef.current?.scrollToBottom();
      setLoading(false);
    }
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
                  .map((message) => {
                    const isMe = message.sender === 'user';
                    return (
                      <Message
                        key={message.timestamp}
                        isMe={isMe}
                        status={message.status}
                        content={message.content}
                        timestamp={message.timestamp}
                        sender={message.sender}
                        robotAvatar={robot.avatar}
                        myAvatar={setting.avatar}
                        name={isMe ? 'Me' : robot.name}
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
