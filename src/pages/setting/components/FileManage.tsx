import { Button } from 'antd';
import { invoke } from '@tauri-apps/api/tauri';
import { appDataDir } from '@tauri-apps/api/path';

async function open() {
  // console.log('分隔符:', sep)
  await invoke('show_in_folder', {
    // 注意,如果要拼接路径,不同OS的路径分隔符,请使用 sep
    path: await appDataDir(),
  });
}
const FileManage = () => {
  return (
    <div>
      <Button
        onClick={() => {
          open();
        }}
      >
        打开存储位置
      </Button>
    </div>
  );
};

export default FileManage;
