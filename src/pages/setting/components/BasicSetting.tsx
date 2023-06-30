import {
  appSettingActions,
  sendKeyOptions,
  useAppSetting,
} from '@/stores/setting';
import { FormattedMessage, getAllLocales } from 'umi';
import { Select, Switch } from 'antd';
import SettingItem from './SettingItem';
import AvatarSelect from '@/pages/chat/components/TopicList/components/AvatarSelect';

const BasicSetting = () => {
  const [setting] = useAppSetting();
  const { language, theme } = setting.basic;
  const { chat, basic } = setting;
  return (
    <>
      <SettingItem label={<FormattedMessage id="setting.avatar" />}>
        <AvatarSelect
          value={basic.avatar}
          singleMode
          onChange={(path) => {
            appSettingActions.updateBasicSetting({
              avatar: path,
            });
          }}
        />
      </SettingItem>
      <SettingItem label={<FormattedMessage id="setting.sendKey" />}>
        <Select
          value={chat.sendKey}
          className="w-full h-9"
          onChange={(sendKey) => {
            appSettingActions.updateChatSetting({
              sendKey,
            });
          }}
          options={sendKeyOptions.map((item) => ({
            label: item,
            value: item,
          }))}
        />
      </SettingItem>
      <SettingItem label={<FormattedMessage id="setting.language" />}>
        <Select
          value={language}
          className="w-full h-9"
          onChange={(value) => {
            appSettingActions.updateBasicSetting({
              language: value,
            });
          }}
          options={getAllLocales().map((item) => ({
            label: item,
            value: item,
          }))}
        />
      </SettingItem>
      <SettingItem label={<FormattedMessage id="setting.theme" />}>
        <Switch
          checkedChildren="黑暗"
          unCheckedChildren="普通"
          checked={theme === 'dark'}
          onChange={(e) => {
            appSettingActions.toggleTheme();
          }}
        />
      </SettingItem>
    </>
  );
};
export default BasicSetting;
