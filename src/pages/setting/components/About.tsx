import { getVersion } from '@tauri-apps/api/app';
import { Typography } from 'antd';
import { useEffect, useState } from 'react';

const { Title, Paragraph } = Typography;
const About = () => {
  const [version, setVersion] = useState<string>('');
  useEffect(() => {
    getVersion().then((version) => {
      setVersion(version);
    });
  }, []);
  return (
    <Typography>
      <Title>关于</Title>
      <Paragraph>该软件使用 Tauri 及一系列开源项目组成，仅供学习使用</Paragraph>
      <Paragraph>Slebee(365456507@qq.com)</Paragraph>
      <Paragraph>当前版本-v{version}</Paragraph>
    </Typography>
  );
};

export default About;
