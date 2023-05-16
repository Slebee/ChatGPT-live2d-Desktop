import {
  appSettingActions,
  sendKeyOptions,
  useAppSetting,
} from '@/stores/setting';
import { FormattedMessage, getAllLocales, setLocale } from 'umi';
import { Select } from 'antd';
import SettingItem from './SettingItem';
import AvatarSelect from '@/pages/chat/components/TopicList/components/AvatarSelect';

const BasicSetting = () => {
  const [setting] = useAppSetting();
  const { language } = setting.basic;
  const { chat, basic } = setting;
  return (
    <>
      <SettingItem label={<FormattedMessage id="setting.avatar" />}>
        <AvatarSelect
          value={basic.avatar}
          singleMode
          onChange={(path) => {
            appSettingActions.setAvatar(path);
          }}
        />
      </SettingItem>
      <SettingItem label={<FormattedMessage id="setting.sendKey" />}>
        <Select
          value={chat.sendKey}
          className="w-full h-9"
          onChange={appSettingActions.setSendKey}
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
            appSettingActions.setLanguage(value);
            setLocale(value, false);
          }}
          options={getAllLocales().map((item) => ({
            label: item,
            value: item,
          }))}
        />
      </SettingItem>
    </>
  );
};
export default BasicSetting;
