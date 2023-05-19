import Icon from '@/components/Icon';
import { ClearOutlined } from '@ant-design/icons';
import { App } from 'antd';

const Container = ({
  children,
  onClean,
  title,
}: {
  children: React.ReactNode;
  onClean?: () => void;
  title: string;
}) => {
  const { modal } = App.useApp();
  return (
    <div className="flex flex-col h-full w-full">
      {children}
      {onClean && (
        <Icon
          className="fixed bottom-0 right-0 mr-2 mb-2"
          onClick={() => {
            modal.confirm({
              title: '是否确认重置？',
              content: `${title} 将会重置为默认设置`,
              onOk: onClean,
            });
          }}
        >
          <ClearOutlined />
        </Icon>
      )}
    </div>
  );
};

export default Container;
