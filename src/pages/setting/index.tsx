import WindowContainer from '@/components/WindowContainer';
import { appSettingActions } from '@/stores/setting';
import { useIntl } from 'umi';
import { Tabs } from 'antd';
import BasicSetting from './components/BasicSetting';
import OpenAISetting from './components/OpenAISetting';
import VitsSetting from './components/VitsSetting';
import Container from './components/Container';
import ClaudeSetting from './components/ClaudeSetting';
import About from './components/About';
import Live2dSetting from './components/Live2dSetting';
import FileManage from './components/FileManage';
import BaiduTranslateSetting from './components/BaiduTranslateSetting';

const Setting = () => {
  const onTabChange = () => {};
  const intl = useIntl();
  const baseSettingTitle = intl.formatMessage({
    id: `setting.baseSetting`,
  });
  const openAiSettingTitle = intl.formatMessage({
    id: `setting.openAiSetting`,
  });
  const claudeSettingTitle = intl.formatMessage({
    id: `setting.claudeSetting`,
  });
  const vitsSettingTitle = intl.formatMessage({
    id: `setting.vitsSetting`,
  });
  const baiduTranslateSettingTitle = intl.formatMessage({
    id: `setting.baiduTranslateSetting`,
  });
  const live2dSettingTitle = intl.formatMessage({
    id: `setting.live2dSetting`,
  });
  const aboutTitle = intl.formatMessage({
    id: `setting.about`,
  });
  const fileManageTitle = intl.formatMessage({
    id: `setting.fileManage`,
  });
  return (
    <WindowContainer name="setting">
      <div className="flex flex-col h-full w-full pl-0 pt-3 pb-3 pr-3">
        <Tabs
          defaultActiveKey="1"
          onChange={onTabChange}
          animated
          tabPosition="left"
          items={[
            {
              key: 'baseSetting',
              label: baseSettingTitle,
              children: (
                <Container
                  title={baseSettingTitle}
                  onClean={appSettingActions.resetBasicSetting}
                >
                  <BasicSetting />
                </Container>
              ),
            },
            {
              key: 'openAiSetting',
              label: openAiSettingTitle,
              children: (
                <Container
                  title={openAiSettingTitle}
                  onClean={appSettingActions.resetOpenAISetting}
                >
                  <OpenAISetting />
                </Container>
              ),
            },
            {
              key: 'claudeSetting',
              label: claudeSettingTitle,
              children: (
                <Container
                  title={claudeSettingTitle}
                  onClean={appSettingActions.resetClaudeSetting}
                >
                  <ClaudeSetting />
                </Container>
              ),
            },
            {
              key: 'vitsSetting',
              label: vitsSettingTitle,
              children: (
                <Container
                  title={vitsSettingTitle}
                  onClean={appSettingActions.resetVitsSetting}
                >
                  <VitsSetting />
                </Container>
              ),
            },
            {
              key: 'baiduTranslateSetting',
              label: baiduTranslateSettingTitle,
              children: (
                <Container
                  title={baiduTranslateSettingTitle}
                  onClean={appSettingActions.resetBaiduTranslateSetting}
                >
                  <BaiduTranslateSetting />
                </Container>
              ),
            },
            {
              key: 'live2dSetting',
              label: live2dSettingTitle,
              children: (
                <Container
                  title={live2dSettingTitle}
                  onClean={appSettingActions.resetChatSetting}
                >
                  <Live2dSetting />
                </Container>
              ),
            },
            {
              key: 'fileManage',
              label: fileManageTitle,
              children: (
                <Container title={fileManageTitle}>
                  <FileManage />
                </Container>
              ),
            },
            {
              key: 'about',
              label: aboutTitle,
              children: (
                <Container title={aboutTitle}>
                  <About />
                </Container>
              ),
            },
          ]}
        />
      </div>
    </WindowContainer>
  );
};
export default Setting;
