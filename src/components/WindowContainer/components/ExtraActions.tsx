import { toggleWindowVisible } from '@/utils';
import { CloseOutlined, PushpinOutlined } from '@ant-design/icons';
import { appWindow } from '@tauri-apps/api/window';
import { Button, Space } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';

const ExtraActions = ({
  windowName,
  className,
}: {
  windowName: string;
  className?: string;
}) => {
  const [fixed, setFixed] = useState<boolean>(false);
  const handleClose = () => {
    toggleWindowVisible(windowName);
  };
  const fixedClass = classNames({
    ['text-primary ']: fixed,
    ['border-none bg-transparent']: true,
  });
  const handleFixed = () => {
    setFixed((fixed) => {
      appWindow.setAlwaysOnTop(!fixed);
      return !fixed;
    });
  };
  return (
    <div
      className={`flex w-full justify-end ${className}`}
      data-tauri-drag-region
    >
      <Space>
        <Button
          size="small"
          className={fixedClass}
          icon={<PushpinOutlined onClick={handleFixed} />}
        />
        <Button
          size="small"
          className="border-none bg-transparent"
          icon={<CloseOutlined onClick={handleClose} />}
        />
      </Space>
    </div>
  );
};

export default ExtraActions;
