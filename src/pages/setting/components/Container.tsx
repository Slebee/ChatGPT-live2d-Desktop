import Icon from '@/components/Icon';
import { ClearOutlined } from '@ant-design/icons';
import { Popconfirm } from 'antd';

const Container = ({
  children,
  onClean,
  title,
}: {
  children: React.ReactNode;
  onClean?: () => void;
  title: string;
}) => (
  <div className="flex flex-col h-full w-full">
    {children}
    {onClean && (
      <Popconfirm
        title="Are you sure to reset this setting?"
        description={`${title} will be reset to default.`}
        onConfirm={onClean}
      >
        <Icon className="fixed bottom-0 right-0 mr-2 mb-2">
          <ClearOutlined />
        </Icon>
      </Popconfirm>
    )}
  </div>
);

export default Container;
