import { useSnapshot } from 'valtio';
import { proxyWithPersist } from '@/utils';
import { chatActionsFactory } from './chats';
import { Speaker } from '@/types';

export type RobotId = string | number;
export type VitsSetting = {
  speaker?: Speaker;

  // 调节语音长度，相当于调节语速，该数值越大语速越慢,默认1.0
  length?: number;

  /** 基本就是数值越小越莫得感情, 默认0.667 */
  noise?: number;
};
export type Robot = {
  id: RobotId;
  name: string;
  description: string;
  introduction: string;
  createdDate: number;
  avatar?: string;
  vits?: VitsSetting;
};
export const robotsState = proxyWithPersist<{
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

export const robotsActions = {
  getCurrentRobot: () => {
    if (!robotsState.currentRobotId) return undefined;
    return robotsState.list.find((r) => r.id === robotsState.currentRobotId);
  },
  addRobot: (robot: Robot) => {
    robotsState.list.push(robot);
    robotsActions.addOpenedRobot(robot.id);
    robotsActions.setCurrentRobotId(robot.id);
  },
  getRobotById: (id: RobotId) => {
    return robotsState.list.find((r) => r.id === id);
  },
  updateRobotById: (id: RobotId, data: Partial<Omit<Robot, 'id'>>) => {
    const robot = robotsActions.getRobotById(id);
    if (!robot) return;
    Object.assign(robot, data);
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
    robotsState.list = robotsState.list.filter((r) => r.id !== robotId);
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
  setVits: (robotId: RobotId, vits: VitsSetting) => {
    const robot = robotsActions.getRobotById(robotId);
    if (!robot) return;
    robot.vits = vits;
  },
};
