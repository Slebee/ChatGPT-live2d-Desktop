import { useAppSetting } from '@/stores/setting';
import { showWindow } from '@/utils';
import { App, Input, message } from 'antd';
import { useState } from 'react';
import { useIntl } from 'umi';

type SearchProps = {
  onSubmit?: (value: string) => void;
  loading?: boolean;
  onClose?: () => void;
};
export default ({ onSubmit, loading }: SearchProps) => {
  const [value, setValue] = useState<string>('');
  const { modal } = App.useApp();
  const [setting] = useAppSetting();
  const intl = useIntl();
  const missingApiKeyMsg = intl.formatMessage({
    id: 'chat.form.missingApiKey',
  });
  const textAreaPlaceholder = intl.formatMessage({
    id: 'chat.form.inputAreaPlaceholder',
  });
  const gotoSettingText = intl.formatMessage({
    id: 'chat.form.gotoSetApiKey',
  });
  const submit = () => {
    if (!setting.openAI.apiKey) {
      modal.confirm({
        title: 'Tips',
        content: missingApiKeyMsg,
        centered: true,
        okText: gotoSettingText,
        okButtonProps: {
          className: 'bg-sky-500',
        },
        onOk: () => {
          showWindow('setting');
        },
      });
      return;
    }
    onSubmit?.(value);
    setValue('');
  };
  return (
    <div className="h-full w-full flex flex-col justify-between p-4">
      <Input.TextArea
        value={value}
        placeholder={textAreaPlaceholder}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        className="bg-slate-50 border-none p-2 flex-auto"
        style={{
          resize: 'none',
        }}
        onKeyDown={(e) => {
          if (loading) {
            message.warning('Please wait for the current request to complete');
            return;
          }
          if (setting.chat.sendKey === 'Enter' && e.key === 'Enter') {
            submit();
          } else if (
            setting.chat.sendKey === 'Ctrl+Enter' &&
            e.ctrlKey &&
            e.key === 'Enter'
          ) {
            submit();
          }
        }}
      />
    </div>
  );
};
