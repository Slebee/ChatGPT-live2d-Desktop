import { appSettingActions, useAppSetting } from '@/stores/setting';
import { FormattedMessage } from 'umi';
import { Alert, Button, Input, message } from 'antd';
import SettingItem from './SettingItem';
import { request } from '@/utils/request';
import { useState } from 'react';

const ClaudeSetting = () => {
  const [setting] = useAppSetting();
  const { claude } = setting;
  const [loading, setLoading] = useState(false);
  const handleTest = () => {
    setLoading(true);
    request(`${setting.claude.server}/test`, {
      responseType: 'text',
    })
      .then((res) => {
        if (res.data === 'yeah') {
          message.success('服务连接畅通');
        } else {
          message.error('服务连接失败');
        }
      })
      .catch((err) => {
        message.error('服务连接失败');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <>
      <Alert
        showIcon
        type="warning"
        className="mb-2"
        message={
          <div>
            使用官方的频道API，所以不需要申请Claude的API，但是需要开放一些权限，具体请参考
            <a
              target="_blank"
              className="text-blue-600"
              href="https://github.com/bincooo/claude-api"
            >
              这里
            </a>
          </div>
        }
      />
      <SettingItem
        label={<FormattedMessage id="setting.claude.server" />}
        description={
          <FormattedMessage id="setting.claude.server.description" />
        }
      >
        <Input
          value={claude?.server}
          className="text-right h-9 w-full"
          onChange={(e) => {
            appSettingActions.updateClaudeSetting({
              server: e.target.value,
            });
          }}
          addonAfter={
            <Button
              loading={loading}
              size="small"
              style={{
                border: 'none',
                background: 'none',
              }}
              onClick={handleTest}
            >
              测试连接
            </Button>
          }
        />
      </SettingItem>
      <SettingItem
        label={<FormattedMessage id="setting.claude.token" />}
        description={<FormattedMessage id="setting.claude.token.description" />}
      >
        <Input
          value={claude?.token}
          className="text-right h-9 w-full"
          placeholder="xoxp-xxxxxxxxxxx"
          onChange={(e) => {
            appSettingActions.updateClaudeSetting({
              token: e.target.value,
            });
          }}
        />
      </SettingItem>
      <SettingItem
        label={<FormattedMessage id="setting.claude.appId" />}
        description={<FormattedMessage id="setting.claude.appId.description" />}
      >
        <Input
          value={claude?.appId}
          className="text-right h-9 w-full"
          placeholder="UOXXXXXXXXXX"
          onChange={(e) => {
            appSettingActions.updateClaudeSetting({
              appId: e.target.value,
            });
          }}
        />
      </SettingItem>
    </>
  );
};
export default ClaudeSetting;
