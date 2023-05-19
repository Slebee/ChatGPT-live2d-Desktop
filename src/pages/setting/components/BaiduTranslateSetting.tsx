import { appSettingActions, useAppSetting } from '@/stores/setting';
import { Alert, Input } from 'antd';
import SettingItem from './SettingItem';

const BaiduTranslateSetting = () => {
  const [setting] = useAppSetting();
  return (
    <>
      <Alert
        showIcon={false}
        type="info"
        className="mb-2"
        message={<div>百度翻译,需要自行申请appid和key;</div>}
      />
      <SettingItem label="Appid">
        <Input
          value={setting.baiduTranslate?.appid}
          className="text-right h-9 w-full"
          onChange={(e) => {
            appSettingActions.updateBaiduTranslateSetting({
              appid: e.target.value,
            });
          }}
        />
      </SettingItem>
      <SettingItem label="Key">
        <Input
          value={setting.baiduTranslate?.key}
          className="text-right h-9 w-full"
          onChange={(e) => {
            appSettingActions.updateBaiduTranslateSetting({
              key: e.target.value,
            });
          }}
        />
      </SettingItem>
    </>
  );
};
export default BaiduTranslateSetting;
