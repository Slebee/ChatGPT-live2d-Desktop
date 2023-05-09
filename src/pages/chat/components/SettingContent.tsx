import {
  appSettingActions,
  modelOptions,
  sendKeyOptions,
  useAppSetting,
} from '@/stores/setting';
import { FormattedMessage, getAllLocales, setLocale } from 'umi';
import { Divider, Input, Select, Slider } from 'antd';
import SettingItem from './SettingItem';
import { LeftOutlined } from '@ant-design/icons';
import Icon from '@/components/Icon';

const SettingContent = ({ onClose }: { onClose: () => void }) => {
  const [setting] = useAppSetting();
  const { openAI, chat, language, vits } = setting;
  return (
    <div className="flex flex-col h-full w-full ">
      <div className="mb-2">
        <Icon className="mr-2" onClick={onClose}>
          <LeftOutlined />
        </Icon>
      </div>
      <div className="flex flex-col pl-2 pr-2 pb-2 overflow-y-auto">
        <Divider orientation="left" orientationMargin="0">
          <FormattedMessage id="setting.baseSetting" />
        </Divider>
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
        <Divider orientation="left" orientationMargin="0">
          <FormattedMessage id="setting.openAiSetting" />
        </Divider>
        <SettingItem label="API Key">
          <Input
            value={openAI.apiKey}
            className="h-9 w-full"
            onChange={(e) => {
              appSettingActions.setApiKey(e.target.value);
            }}
          />
        </SettingItem>
        <SettingItem label={<FormattedMessage id="setting.openAi.model" />}>
          <Select
            value={openAI.model}
            onChange={appSettingActions.setModel}
            className="h-9 w-full"
            options={modelOptions.map((item) => ({
              label: item,
              value: item,
            }))}
          />
        </SettingItem>
        <SettingItem
          label={<FormattedMessage id="setting.openAi.maxTokens" />}
          description={
            <FormattedMessage id="setting.openAi.maxTokens.description" />
          }
        >
          <Input
            value={openAI.maxTokens}
            className="text-right h-9 w-full"
            onChange={(e) => {
              appSettingActions.setMaxTokens(Number(e.target.value));
            }}
          />
        </SettingItem>
        <SettingItem
          label={
            <>
              <FormattedMessage id="setting.openAi.temperature" />(
              {openAI.temperature})
            </>
          }
          description={
            <FormattedMessage id="setting.openAi.temperature.description" />
          }
        >
          <Slider
            min={0.0}
            max={2.0}
            step={0.1}
            value={openAI.temperature}
            className="w-full"
            onChange={appSettingActions.setTemperature}
          />
        </SettingItem>
        <SettingItem
          label={
            <>
              <FormattedMessage id="setting.openAi.presencePenalty" />(
              {openAI.presencePenalty})
            </>
          }
          description={
            <FormattedMessage id="setting.openAi.presencePenalty.description" />
          }
        >
          <Slider
            min={-2.0}
            max={2.0}
            step={0.1}
            value={openAI.presencePenalty}
            className="w-full"
            onChange={appSettingActions.setPresencePenalty}
          />
        </SettingItem>
        <SettingItem
          label={<FormattedMessage id="setting.openAi.basePath" />}
          description={
            <FormattedMessage id="setting.openAi.basePath.description" />
          }
        >
          <Input
            value={openAI.basePath}
            className="text-right h-9 w-full"
            onChange={(e) => {
              appSettingActions.setBathPath(e.target.value);
            }}
          />
        </SettingItem>
        <SettingItem
          label={
            <>
              <FormattedMessage id="setting.openAi.chatHistorySize" />(
              {openAI.historySize})
            </>
          }
          description={
            <FormattedMessage id="setting.openAi.chatHistorySize.description" />
          }
        >
          <Slider
            min={0}
            max={32}
            step={1}
            value={openAI.historySize}
            className="w-full"
            onChange={appSettingActions.setChatHistorySize}
          />
        </SettingItem>
        <Divider orientation="left" orientationMargin="0">
          <FormattedMessage id="setting.vitsSetting" />
        </Divider>
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
          />
        </SettingItem>
      </div>
    </div>
  );
};

export default SettingContent;
