import { Outlet } from 'umi';
import { App, ConfigProvider, theme } from 'antd';
import { useAppSetting } from '@/stores/setting';

export default function Layout() {
  const [setting] = useAppSetting();
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          // lineWidth: 0,
          colorBgContainer: '#f5f5f5',
        },
        algorithm:
          setting.basic.theme === 'dark'
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
      }}
    >
      <App className="h-full">
        <Outlet />
      </App>
    </ConfigProvider>
  );
}
