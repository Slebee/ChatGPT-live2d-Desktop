import { useSnapshot } from 'valtio';
import { proxyWithPersist } from '@/utils/storage';
import { chatActionsFactory } from './chats';
import { Speaker } from '@/types';
import { RobotType } from '@/enum/robot';
import { PoeBot } from '@/poe';

export type RobotId = number | string;
export type VitsSetting = {
  speaker?: Speaker;

  // 调节语音长度，相当于调节语速，该数值越大语速越慢,默认1.0
  length?: number;

  /** 基本就是数值越小越莫得感情, 默认0.667 */
  noise?: number;

  enabled?: boolean;
};

export type BaiduTranslateSetting = {
  enabled?: boolean;
  from: string;
  to: string;
};
export type Robot = PoeBot & {
  avatar?: string;
  vits?: VitsSetting;
  createdDate: number;
  streamed?: boolean;
  type: RobotType;
  claude?: {
    channelId?: string;
  };
  baiduTranslate?: BaiduTranslateSetting;

  isPoeBot?: boolean;
};
export const robotsState = await proxyWithPersist<{
  list: Robot[];
  openedRobots: RobotId[];
  currentRobotId?: RobotId;
  fullScreenRobot?: Robot;
  filter?: string;
}>('robots', {
  list: [],
  openedRobots: [],
});

export const useRobots = () => {
  const robots = useSnapshot(robotsState);
  return {
    robots: robots.list,
    openedRobots: robots.openedRobots,
    currentRobotId: robots.currentRobotId,
    fullScreenRobot: robots.fullScreenRobot,
    filter: robots.filter,
  };
};
export const useRobot = (robotId: RobotId) => {
  const robots = useSnapshot(robotsState);
  return robots.list.find((r) => r.botId === robotId);
};

export const robotsActions = {
  getCurrentRobot: () => {
    if (!robotsState.currentRobotId) return undefined;
    return robotsState.list.find((r) => r.botId === robotsState.currentRobotId);
  },
  addRobot: (robot: Robot) => {
    robotsState.list.push(robot);
    robotsActions.addOpenedRobot(robot.botId);
    robotsActions.setCurrentRobotId(robot.botId);
  },
  addRobots: (robots: Robot[]) => {
    robotsState.list = robotsState.list.concat(robots);
  },
  getRobotById: (id: RobotId) => {
    return robotsState.list.find((r) => r.botId === id);
  },
  updateRobotById: (id: RobotId, data: Partial<Omit<Robot, 'id'>>) => {
    const robot = robotsActions.getRobotById(id);
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // @ts-ignore
        robot[key] = data[key];
      }
    }
  },
  removeRobot: (robotId: RobotId) => {
    if (robotsState.currentRobotId === robotId) {
      robotsState.currentRobotId = undefined;
    }
    if (robotsState.openedRobots.includes(robotId)) {
      robotsState.openedRobots = robotsState.openedRobots.filter(
        (id) => id !== robotId,
      );
    }
    robotsState.list = robotsState.list.filter((r) => r.botId !== robotId);
    chatActionsFactory(robotId).removeAllMessages();
  },
  addOpenedRobot: (robotId: RobotId) => {
    if (robotsState.openedRobots.includes(robotId)) return;
    robotsState.openedRobots.push(robotId);
  },
  removeOpenedRobot: (robotId: RobotId) => {
    robotsState.openedRobots = robotsState.openedRobots.filter(
      (id) => id !== robotId,
    );
  },
  setCurrentRobotId: (robotId: RobotId) => {
    robotsState.currentRobotId = robotId;
  },
  cleanCurrentRobotId: () => {
    robotsState.currentRobotId = undefined;
  },
  setFullScreenRobot: (robot: Robot) => {
    robotsState.fullScreenRobot = robot;
  },
  cleanFullScreenRobot: () => {
    robotsState.fullScreenRobot = undefined;
  },
  setFilter: (filter: string) => {
    robotsState.filter = filter;
  },

  // vits
  updateVits: (robotId: RobotId, vits: VitsSetting) => {
    const robot = robotsActions.getRobotById(robotId);
    if (!robot) return;
    robot.vits = {
      ...robot.vits,
      ...vits,
    };
  },
};
