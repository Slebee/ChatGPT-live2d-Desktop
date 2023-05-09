import Icon from '@/components/Icon';
import { appSettingActions, useAppSetting } from '@/stores/setting';
import { SettingOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import DarkIcon from './DarkIcon';
import LightIcon from './LightIcon';

type TopicListActionsProps = {};
const TopicListActions = ({}: TopicListActionsProps) => {
  const [setting] = useAppSetting();
  return (
    <div className="p-2">
      <Space>
        <Icon
          onClick={() => {
            appSettingActions.toggleSetting();
          }}
        >
          <SettingOutlined />
        </Icon>
        <Icon onClick={appSettingActions.toggleTheme}>
          {setting.theme === 'dark' ? (
            <LightIcon className="w-5" />
          ) : (
            <DarkIcon className="w-5" />
          )}
        </Icon>
      </Space>
    </div>
  );
};

export default TopicListActions;
