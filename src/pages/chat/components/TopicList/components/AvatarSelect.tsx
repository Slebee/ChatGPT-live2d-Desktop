import { UploadOutlined } from '@ant-design/icons';
import { Avatar, Popover, Space } from 'antd';
import { open } from '@tauri-apps/api/dialog';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { useState } from 'react';

type AvatarSelectProps = {
  value?: string;
  onChange?: (value: string) => void;
  singleMode?: boolean;
};
type AvatarItem = {
  src: string;
  name: string;
};
const AvatarSelect = ({ value, onChange, singleMode }: AvatarSelectProps) => {
  const [avatarList, setAvatarList] = useState<AvatarItem[]>([
    {
      src: '/avatars/cat.png',
      name: 'cat',
    },
    {
      src: '/avatars/nanachi.png',
      name: 'nanachi',
    },
    {
      src: '/avatars/mdg.png',
      name: 'mdg',
    },
  ]);
  const handleUpload = async () => {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: 'Image',
          extensions: ['png', 'jpeg'],
        },
      ],
    });
    if (!selected) return;
    const src = await convertFileSrc(selected as string);
    setAvatarList((prev) => [...prev, { src, name: 'custom' }]);
    onChange?.(src);
  };
  if (singleMode) {
    return (
      <Avatar src={value} className="cursor-pointer" onClick={handleUpload} />
    );
  }
  const content = (
    <Space>
      {avatarList.map((item) => (
        <Avatar
          className="cursor-pointer"
          key={item.src}
          src={item.src}
          onClick={() => {
            onChange?.(item.src);
          }}
        />
      ))}
      <Avatar
        className="cursor-pointer"
        onClick={handleUpload}
        icon={<UploadOutlined />}
      />
    </Space>
  );
  return (
    <Popover content={content} title="Select robot's avatar">
      <Avatar src={value} className="cursor-pointer" />
    </Popover>
  );
};
export default AvatarSelect;
