import { Avatar, Col, Row, Space } from 'antd';
import styles from './Message.less';
import MarkdownIt from 'markdown-it';
//@ts-ignore
import mdKatex from 'markdown-it-katex';
import mdHighlight from 'markdown-it-highlightjs';
import { useEventListener } from '@/hooks/useEventListener';
import { useClipboard } from '@/hooks/useClipboard';
import classNames from 'classnames';
import { ChatMessage } from '@/pages/chat/stores/chats';
import VoiceIcon from '@/components/VoiceIcon';
import { RobotId, useRobot } from '@/pages/chat/stores/robots';
import { VitsStatusEnum } from '@/pages/chat/hooks/useVits';
export type MessageProps = ChatMessage & {
  isMe?: boolean;
  myAvatar?: string;
  onDelete?: () => void;
  onRetry?: () => void;
  robotId?: RobotId;

  audioStatus: VitsStatusEnum;
  onAudioPlay?: () => void;
  onAudioPause?: () => void;
};

const Loading = () => (
  <div>
    {Array.from({ length: 3 }).map((_, i) => (
      <span
        key={i}
        className="animate-bounce2 inline-block w-1 h-1 bg-slate-600 mr-1 rounded-full"
      />
    ))}
  </div>
);
export default ({
  content,
  isMe,
  myAvatar,
  status,
  onDelete,
  onRetry,
  robotId,
  audioStatus,
  onAudioPlay,
  onAudioPause,
}: MessageProps) => {
  const { copied, copy } = useClipboard({
    source: '',
    copiedDuring: 1000,
  });
  const robot = useRobot(robotId!);
  useEventListener('click', (e) => {
    const el = e.target as HTMLElement;
    let code = null;

    if (el.matches('.gpt-copy-icon')) {
      code = decodeURIComponent(el.parentElement?.dataset.code!);
      copy(code);
    }
  });
  const htmlString = () => {
    const md = MarkdownIt({
      linkify: true,
      breaks: true,
    })
      .use(mdKatex)
      .use(mdHighlight);
    const fence = md.renderer.rules.fence!;
    md.renderer.rules.fence = (...args) => {
      const [tokens, idx] = args;
      const token = tokens[idx];
      const rawCode = fence(...args);

      return `<div class="mb-3 relative">
              <div class="gpt-copy-tips-wrapper" data-code=${encodeURIComponent(
                token.content,
              )} style="text-align: right;">
                  <svg class="gpt-copy-icon" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32"><path fill="currentColor" d="M28 10v18H10V10h18m0-2H10a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z" /><path fill="currentColor" d="M4 18H2V4a2 2 0 0 1 2-2h14v2H4Z" /></svg>
                    <div class="gpt-copy-tips">
                    ${copied ? 'Copied' : 'Copy'}
                    </div>
              </div>
              ${rawCode}
              </div>`;
    };

    if (typeof content === 'string') return md.render(content);
    return '';
  };
  const roleCol = (
    <Col className={styles.role} flex="none">
      <Avatar src={isMe ? myAvatar : robot?.avatar} />
    </Col>
  );
  const fillCol = (
    <Col className={styles['null-role']} flex="none">
      <Avatar src={isMe ? myAvatar : robot?.avatar} />
    </Col>
  );

  const contentClass = classNames({
    [styles.content]: true,
    [styles.isMe]: isMe,
  });
  const contentCol = (
    <Col className={contentClass} flex="auto">
      {!isMe && status === 'failed' && (
        <div className="pb-1">
          <Space>
            <a className="text-[#cccccc] text-sm" onClick={onDelete}>
              删除
            </a>
            <a className="text-[#cccccc] text-sm" onClick={onRetry}>
              重发
            </a>
          </Space>
        </div>
      )}
      <div
        className={classNames({
          'text-slate-700': status !== 'failed',
          [styles.contentText]: true,
          'max-w-full': true,
          'bg-white': !isMe,
          'bg-primary text-white': isMe,
          'text-red-500': status === 'failed',
          relative: true,
        })}
      >
        <div
          className="select-text"
          dangerouslySetInnerHTML={
            status === 'sending'
              ? undefined
              : {
                  __html: htmlString(),
                }
          }
          children={status === 'sending' ? <Loading /> : undefined}
        />
        {!isMe && robot?.vits?.enabled && status === 'sent' && (
          <VoiceIcon
            status={audioStatus}
            onPlay={onAudioPlay}
            onPaused={onAudioPause}
          />
        )}
      </div>
    </Col>
  );

  return (
    <Row className={`${styles.container} mb-2`} wrap={false} gutter={10}>
      {!isMe ? (
        <>
          {roleCol}
          {contentCol}
          {fillCol}
        </>
      ) : (
        <>
          {fillCol}
          {contentCol}
          {roleCol}
        </>
      )}
    </Row>
  );
};
