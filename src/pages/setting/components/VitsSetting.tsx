import { appSettingActions, useAppSetting } from '@/stores/setting';
import { FormattedMessage } from 'umi';
import { Alert, Button, Input, message } from 'antd';
import SettingItem from './SettingItem';
import { useState } from 'react';
import { request } from '@/utils/request';

const VitsSetting = () => {
  const [setting] = useAppSetting();
  const { vits } = setting;
  const [loading, setLoading] = useState(false);
  const handleTest = () => {
    setLoading(true);
    request(`${vits.basePath}/voice/speakers`)
      .then((res) => {
        if (Array.isArray(res.data.VITS)) {
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
        type="info"
        className="mb-2"
        message={
          <div>
            文字转语音能力目前使用
            <a
              target="_blank"
              className="ml-2 text-blue-600"
              href="https://github.com/Artrajz/vits-simple-api"
            >
              vits-simple-api
            </a>
            ，如需支持需要下载window一键包并启动该程序。
          </div>
        }
      />
      <SettingItem
        label={<FormattedMessage id="setting.vits.basePath" />}
        description={
          <FormattedMessage id="setting.vits.basePath.description" />
        }
      >
        <Input
          value={vits.basePath}
          className="text-right h-9 w-full"
          onChange={(e) => {
            appSettingActions.setVitsBasePath(e.target.value);
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
    </>
  );
};
export default VitsSetting;
