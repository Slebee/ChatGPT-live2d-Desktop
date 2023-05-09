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
import { Avatar, Modal } from 'antd';
import AddTopicModal from '../../TopicList/components/AddTopicModal';
import { toggleWindowVisible } from '@/utils';
import { FormattedMessage } from 'umi';
import { appSettingActions, useAppSetting } from '@/stores/setting';

const ChatHeader = () => {
  const { currentRobotId, fullScreenRobot, robots } = useRobots();
  const [setting] = useAppSetting();
  const currentRobot = robots.find((robot) => robot.id === currentRobotId);
  const handleClean = () => {
    Modal.confirm({
      title: '清空聊天记录',
      content: '确定要清空聊天记录吗？',
      onOk: () => {
        if (currentRobotId) chatActionsFactory(currentRobotId).cleanMessages();
      },
      okButtonProps: {
        className: 'bg-sky-500',
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
      <div className="flex-auto truncate w-9 h-9 ">
        <h2 className="text-sm font-bold text-slate-700">
          {currentRobot?.name}
        </h2>
        <div className="text-xs text-slate-500 truncate w-full text-truncate">
          {currentRobot?.description}
        </div>
      </div>
      <Icon onClick={appSettingActions.toggleVisAllowAudio}>
        {setting.vits.allowAudio ? <AudioMutedOutlined /> : <AudioOutlined />}
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

      <Icon className="w-8 h-8 flex-none" onClick={handleClean}>
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
