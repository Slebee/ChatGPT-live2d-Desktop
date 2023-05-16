import { Col, Row } from 'antd';
import { useEffect } from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api';
import { useIntl } from 'umi';
import ExtraActions from './components/ExtraActions';
import { setShadow } from '@/utils/shadow';

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
  const intl = useIntl();
  const titleName = intl.formatMessage({
    id: `page.${name}.title`,
  });
  useEffect(() => {
    if (hasShadow) {
      setShadow(name);
    }
  }, []);

  useEffect(() => {
    appWindow.setTitle(titleName);
  }, [titleName]);

  return (
    <div className={`h-full w-full flex flex-col pt-8 ${className ?? ''}`}>
      <div
        className="p-1 fixed top-0 left-0 right-0 border-t-0 border-l-0 border-r-0 border-solid border-b border-gray-300"
        // style={{ borderBottom: '1px solid #ccc' }}
        data-tauri-drag-region
      >
        <Row data-tauri-drag-region>
          <Col span={12} data-tauri-drag-region>
            {/* <Avatar src="/avatars/avatar.png" className="w-5 h-5" /> */}
            <span className="ml-2">{titleName}</span>
          </Col>
          <Col span={12} data-tauri-drag-region>
            <ExtraActions windowName={name} />
          </Col>
        </Row>
      </div>
      <div className="grow overflow-y-auto">{children}</div>
    </div>
  );
};

export default WindowContainer;
