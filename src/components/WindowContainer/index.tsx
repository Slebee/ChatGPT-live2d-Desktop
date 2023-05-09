import { Col, Row, Space } from 'antd';
import { CloseOutlined, PushpinOutlined } from '@ant-design/icons';
import { toggleWindowVisible } from '@/utils';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { appWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api';
import { useIntl } from 'umi';

export type WindowContainerProps = {
  name: string;
  children: React.ReactNode;
  hasShadow?: boolean;
  sider?: React.ReactNode;
  className?: string;
};
const WindowContainer = ({
  children,
  name,
  hasShadow = true,
  className,
}: WindowContainerProps) => {
  const [fixed, setFixed] = useState<boolean>(false);
  const intl = useIntl();
  const titleName = intl.formatMessage({
    id: `page.${name}.title`,
  });
  const handleClose = () => {
    toggleWindowVisible(name);
  };
  const fixedClass = classNames({
    ['text-primary']: fixed,
    ['border-none']: true,
  });
  const handleFixed = () => {
    setFixed((fixed) => {
      appWindow.setAlwaysOnTop(!fixed);
      return !fixed;
    });
  };
  useEffect(() => {
    async function setShadow() {
      await invoke('set_shadow', { label: name });
    }
    if (hasShadow) {
      setShadow();
    }
  }, []);

  useEffect(() => {
    appWindow.setTitle(titleName);
  }, [titleName]);

  return (
    <div className={`h-full w-full flex flex-col pt-8 ${className ?? ''}`}>
      <div
        className="p-1 border-b fixed top-0 left-0 right-0"
        data-tauri-drag-region
      >
        <Row data-tauri-drag-region>
          <Col span={12} data-tauri-drag-region>
            {/* <Avatar src="/avatars/avatar.png" className="w-5 h-5" /> */}
            <span className="ml-2">{titleName}</span>
          </Col>
          <Col
            span={12}
            data-tauri-drag-region
            className="flex flex-wrap justify-end"
          >
            <Space>
              <PushpinOutlined className={fixedClass} onClick={handleFixed} />
              <CloseOutlined
                className="border-none mr-1"
                onClick={handleClose}
              />
            </Space>
          </Col>
        </Row>
      </div>
      <div className="grow overflow-y-auto">{children}</div>
    </div>
  );
};

export default WindowContainer;
