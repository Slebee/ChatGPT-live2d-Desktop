import { RobotType } from '@/enum/robot';
import { Tag } from 'antd';

export const getRobotTag = (robotType: RobotType) => {
  if (robotType === RobotType.GPT) {
    return (
      <Tag color="magenta" bordered={false}>
        ChatGpt
      </Tag>
    );
  }
  return (
    <Tag color="cyan" bordered={false}>
      Claude
    </Tag>
  );
};
