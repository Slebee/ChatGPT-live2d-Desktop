import {
  appSettingActions,
  modelOptions,
  useAppSetting,
} from '@/stores/setting';
import { FormattedMessage } from 'umi';
import { Input, Select, Slider } from 'antd';
import SettingItem from './SettingItem';

const OpenAISetting = () => {
  const [OpenAISetting] = useAppSetting();
  const { openAI } = OpenAISetting;
  return (
    <>
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
          className="h-9 w-full"
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
    </>
  );
};
export default OpenAISetting;
