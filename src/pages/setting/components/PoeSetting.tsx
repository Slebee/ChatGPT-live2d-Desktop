import { appSettingActions, useAppSetting } from '@/stores/setting';
import { Alert, Input, Switch } from 'antd';
import { FormattedMessage } from 'umi';
import SettingItem from './SettingItem';

const PoeSetting = () => {
  const [setting] = useAppSetting();
  return (
    <>
      <Alert
        showIcon={false}
        type="info"
        className="mb-2"
        message={<div>Poe 的机器人不允许编辑头像、名称等</div>}
      />
      <SettingItem label={<FormattedMessage id="setting.poe.enabled" />}>
        <Switch
          checkedChildren="启用"
          unCheckedChildren="禁用"
          checked={setting.poe?.enabled}
          onChange={(e) => {
            appSettingActions.updatePoeSetting({
              enabled: e,
            });
          }}
        />
      </SettingItem>

      <SettingItem label="Base Path">
        <Input
          value={setting.poe?.basePath}
          className="text-right h-9 w-full"
          onChange={(e) => {
            appSettingActions.updatePoeSetting({
              basePath: e.target.value,
            });
          }}
        />
      </SettingItem>
      <SettingItem label={<FormattedMessage id="setting.poe.proxy" />}>
        <Input
          value={setting.poe?.proxy}
          className="text-right h-9 w-full"
          onChange={(e) => {
            appSettingActions.updatePoeSetting({
              proxy: e.target.value,
            });
          }}
        />
      </SettingItem>
      <SettingItem label="p-b">
        <Input
          value={setting.poe?.pb}
          className="text-right h-9 w-full"
          onChange={(e) => {
            appSettingActions.updatePoeSetting({
              pb: e.target.value,
            });
          }}
        />
      </SettingItem>
    </>
  );
};
export default PoeSetting;
