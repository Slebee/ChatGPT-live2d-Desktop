import { useAutoAnimate } from '@formkit/auto-animate/react';
import { robotsActions, useRobots } from '@/pages/chat/stores/robots';
import Item from './components/Item';

import { appSettingActions, useAppSetting } from '@/stores/setting';
import { emit } from '@tauri-apps/api/event';
import { Events } from '@/enum/events';
import { getBotInfoByDisplayName } from '@/poe';
import { App } from 'antd';
import { debounce } from '@/utils';
import { RobotType } from '@/enum/robot';

const updateBotInfoByDisplayNameDebounce = debounce(
  async (
    params: { displayName: string; botId: number },
    onError: (msg: string) => void,
  ) => {
    try {
      const {
        data: { status, data },
      } = await getBotInfoByDisplayName(params.displayName);
      if (status === 'success') {
        robotsActions.updateRobotById(params.botId, data.defaultBotObject);
      }
    } catch (error: any) {
      onError(error.message);
    }
  },
  500,
);
export type TopicListProps = {};
const TopicList = ({}: TopicListProps) => {
  const { robots, currentRobotId, filter } = useRobots();
  const { message } = App.useApp();
  const [setting] = useAppSetting();
  const [parent] = useAutoAnimate(/* optional config */);
  return (
    <div ref={parent} className="overflow-y-auto overflow-x-hidden">
      {robots
        .filter((robot) => {
          if (robot.deletionState !== 'not_deleted') {
            return false;
          }
          if (filter) {
            return robot.displayName.includes(filter);
          }
          return true;
        })
        .filter((robot) => {
          if (setting.poe.enabled) {
            return true;
          } else {
            return !robot.isPoeBot;
          }
        })
        // 根据createdDate排序
        .sort((a, b) => {
          return b.createdDate - a.createdDate;
        })
        .map((robot) => {
          return (
            <Item
              key={robot.botId}
              robot={robot}
              active={robot.botId === currentRobotId}
              onClick={async () => {
                robotsActions.setCurrentRobotId(robot.botId);
                robotsActions.addOpenedRobot(robot.botId);
                appSettingActions.toggleSetting(false);
                await emit(Events.currentRobotChanged, {
                  robotId: robot.botId,
                });
                if (robot.type === RobotType.POE) {
                  updateBotInfoByDisplayNameDebounce(
                    {
                      displayName: robot.displayName,
                      botId: robot.botId,
                    },
                    (m: string) => {
                      message.error(`更新${robot.displayName}信息失败: ${m}`);
                    },
                  );
                }
              }}
              onRemove={() => {
                robotsActions.removeRobot(robot.botId);
              }}
            />
          );
        })}
    </div>
  );
};

export default TopicList;
