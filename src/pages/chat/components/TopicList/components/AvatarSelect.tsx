import { Avatar, Popover, Space } from 'antd';

type AvatarSelectProps = {
  value?: string;
  onChange?: (value: string) => void;
};

const avatarList = [
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
  {
    src: '/avatars/mikasa.png',
    name: 'mikasa',
  },
];
const AvatarSelect = ({ value, onChange }: AvatarSelectProps) => {
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
    </Space>
  );
  return (
    <Popover content={content} title="select robot's avatar">
      <Avatar src={value} />
    </Popover>
  );
};
export default AvatarSelect;
