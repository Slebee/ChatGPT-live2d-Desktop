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
  if (robotType === RobotType.POE) {
    return (
      <Tag color="orange" bordered={false}>
        Poe
      </Tag>
    );
  }
  return (
    <Tag color="cyan" bordered={false}>
      Claude
    </Tag>
  );
};
