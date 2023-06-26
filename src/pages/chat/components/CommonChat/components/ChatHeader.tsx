import Icon from '@/components/Icon';
import { chatActionsFactory } from '@/pages/chat/stores/chats';
import { robotsActions, useRobots } from '@/pages/chat/stores/robots';
import {
  AudioMutedOutlined,
  AudioOutlined,
  ClearOutlined,
  EditOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import { Avatar, App, message } from 'antd';
import AddTopicModal from '../../TopicList/components/AddTopicModal';
import { toggleWindowVisible } from '@/utils';
import { FormattedMessage } from 'umi';
import { getRobotTag } from '@/pages/chat/_util';
import { useState } from 'react';

const ChatHeader = () => {
  const { modal } = App.useApp();
  const { currentRobotId, fullScreenRobot, robots } = useRobots();
  const [clearHistoryLoading, setClearHistoryLoading] = useState(false);
  const currentRobot = robots.find((robot) => robot.botId === currentRobotId);
  const handleClean = () => {
    modal.confirm({
      title: '清空聊天记录',
      content: '确定要清空聊天记录吗？',
      onOk: () => {
        if (currentRobotId) {
          setClearHistoryLoading(true);
          chatActionsFactory(currentRobotId)
            .cleanMessages()
            .then((res) => {
              if (res.status === 'success') {
                message.success('清空成功');
              } else if (res.status === 'failed') {
                modal.error({
                  title: '清空失败',
                  content: res.message,
                });
              } else if (res.status === 'confirm') {
                modal.confirm({
                  title: '提示',
                  content: res.message,
                  onOk: res.clean,
                });
              }
            })
            .finally(() => {
              setClearHistoryLoading(false);
            });
        }
      },
    });
  };
  return (
    <div className={`flex p-3`}>
      <Avatar
        size="large"
        className="flex-none mr-2 w-9 h-9"
        src={currentRobot?.avatar}
      />
      <div className="flex-auto w-9 h-9 ">
        <h2 className="text-sm truncate w-full text-truncate">
          <span className="mr-2">{currentRobot?.displayName}</span>
          <span className="font-normal">{getRobotTag(currentRobot!.type)}</span>
        </h2>
        <div className="text-xs text-slate-500 truncate w-full text-truncate">
          {currentRobot?.description}
        </div>
      </div>
      <Icon
        onClick={() => {
          robotsActions.updateVits(currentRobot!.botId, {
            enabled: !currentRobot?.vits?.enabled,
          });
        }}
      >
        {currentRobot?.vits?.enabled ? (
          <AudioOutlined />
        ) : (
          <AudioMutedOutlined />
        )}
      </Icon>
      <Icon
        onClick={() => {
          toggleWindowVisible('live2d');
        }}
      >
        <HeartOutlined />
      </Icon>
      <AddTopicModal
        title={<FormattedMessage id="chat.form.editChat" />}
        initialValues={currentRobot}
      >
        <Icon className="w-8 h-8 flex-none">
          <EditOutlined />
        </Icon>
      </AddTopicModal>

      <Icon
        className="w-8 h-8 flex-none"
        onClick={handleClean}
        loading={clearHistoryLoading}
      >
        <ClearOutlined />
      </Icon>
      <Icon
        className="w-8 h-8 flex-none"
        onClick={() => {
          if (fullScreenRobot) {
            robotsActions.cleanFullScreenRobot();
          } else {
            robotsActions.setFullScreenRobot(currentRobot!);
          }
        }}
      >
        {fullScreenRobot ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
      </Icon>
    </div>
  );
};

export default ChatHeader;
