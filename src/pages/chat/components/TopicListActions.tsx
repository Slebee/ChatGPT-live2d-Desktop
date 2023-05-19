import Icon from '@/components/Icon';
import { SettingOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import { toggleWindowVisible } from '@/utils';

type TopicListActionsProps = {};
const TopicListActions = ({}: TopicListActionsProps) => {
  return (
    <div className="p-2">
      <Space>
        <Icon
          onClick={() => {
            toggleWindowVisible('setting');
          }}
        >
          <SettingOutlined />
        </Icon>
      </Space>
    </div>
  );
};

export default TopicListActions;
