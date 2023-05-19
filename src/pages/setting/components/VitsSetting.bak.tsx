import { appSettingActions, useAppSetting } from '@/stores/setting';
import { FormattedMessage } from 'umi';
import { open } from '@tauri-apps/api/dialog';
import { Child, Command } from '@tauri-apps/api/shell';
import { Alert, App, Button, Input, Space } from 'antd';
import SettingItem from './SettingItem';
import { useState } from 'react';
import { request } from '@/utils/request';

let child: Child | null = null;

const VitsSetting = () => {
  const [setting] = useAppSetting();
  const { vits } = setting;
  const [loading, setLoading] = useState(false);
  const { message, modal } = App.useApp();
  const [startServerLoading, setStartServerLoading] = useState(false);
  const [serverRunning, setServerRunning] = useState(false);
  const handleTest = () => {
    setLoading(true);
    return request(`${vits.basePath}/voice/speakers`)
      .then((res) => {
        if (Array.isArray(res.data.VITS)) {
          return true;
        }
        return false;
      })
      .catch(() => {
        return false;
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handleOpenFolder = async () => {
    const selected = await open({
      multiple: false,
      directory: true,
    });
    if (!selected) return;
    appSettingActions.updateVisSetting({
      folderPath: selected as string,
    });
  };
  const handleStartServer = async () => {
    setStartServerLoading(true);
    const isRunning = await handleTest();
    if (isRunning) {
      setServerRunning(true);
      setStartServerLoading(false);
      return;
    }
    if (child) {
      message.error('服务已启动');
      setStartServerLoading(false);
      return;
    }
    child = null;
    const windows = navigator.userAgent.includes('Windows');
    let cmd = windows ? 'cmd' : 'sh';
    let args = windows ? ['/C'] : ['-c'];
    const command = new Command(cmd, [...args, 'start.bat'], {
      cwd: vits.folderPath,
      // env: _getEnv(),
      encoding: 'gbk',
    });
    command.on('close', (data) => {
      setServerRunning(false);
      setStartServerLoading(false);
      console.log(
        `command finished with code ${data.code} and signal ${data.signal}`,
      );
      child = null;
    });
    command.on('error', (error) => {
      setServerRunning(false);
      setStartServerLoading(false);
      console.error(`command error: "${error}"`);
    });
    command.stdout.on('data', (line) => {
      console.log(`command stdout: "${line}"`);
    });
    command.stderr.on('data', (line) => {
      console.log(`command stderr: "${line}"`);
      if (line.includes('Running on')) {
        setStartServerLoading(false);
        setServerRunning(true);
        const serverAddress = line.split('Running on')[1].trim();
        appSettingActions.updateVisSetting({
          basePath: serverAddress,
        });
      }
    });

    child = await command.spawn();
    console.log('childPid', child.pid);
  };
  const handleStopServer = async () => {
    await child?.write('exit /b \n');
    await child
      ?.kill()
      .then(() => {
        // 需要手动杀死python进程，child.kill仅杀死子进程
        new Command('cmd', ['/C', `taskkill /F /IM vitsPython.exe`]).execute();
        setServerRunning(false);
        message.success('服务已停止');
      })
      .catch((err) => {
        modal.error({
          title: '服务停止失败',
          content: err.message,
        });
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
        label={<FormattedMessage id="setting.vits.folderPath" />}
        description={
          <FormattedMessage id="setting.vits.folderPath.description" />
        }
      >
        <Input
          value={vits.folderPath}
          className="text-right h-9 w-full"
          onChange={(e) => {
            appSettingActions.updateVisSetting({
              folderPath: e.target.value,
            });
          }}
          addonAfter={
            <Space>
              <Button
                size="small"
                style={{
                  border: 'none',
                  background: 'none',
                }}
                onClick={handleOpenFolder}
              >
                选择
              </Button>
              {vits.folderPath && (
                <Button
                  loading={startServerLoading}
                  size="small"
                  style={{
                    border: 'none',
                    background: 'none',
                  }}
                  onClick={serverRunning ? handleStopServer : handleStartServer}
                >
                  {serverRunning ? '停止服务' : '启动服务'}
                </Button>
              )}
            </Space>
          }
        />
      </SettingItem>
      <Button
        loading={loading}
        onClick={() => {
          handleTest().then((res) => {
            if (res) {
              message.success('连接成功');
            } else {
              message.error('连接失败');
            }
          });
        }}
      >
        测试连接
      </Button>
    </>
  );
};
export default VitsSetting;
