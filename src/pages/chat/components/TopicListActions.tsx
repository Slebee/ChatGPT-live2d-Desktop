import Icon from '@/components/Icon';
import { appSettingActions, useAppSetting } from '@/stores/setting';
import { SettingOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import DarkIcon from './DarkIcon';
import LightIcon from './LightIcon';
import { toggleWindowVisible } from '@/utils';

type TopicListActionsProps = {};
const TopicListActions = ({}: TopicListActionsProps) => {
  const [setting] = useAppSetting();
  return (
    <div className="p-2">
      <Space>
        <Icon
          onClick={() => {
            toggleWindowVisible('setting');
            // appSettingActions.toggleSetting();
          }}
        >
          <SettingOutlined />
        </Icon>
        <Icon onClick={appSettingActions.toggleTheme}>
          {setting.basic.theme === 'dark' ? (
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
