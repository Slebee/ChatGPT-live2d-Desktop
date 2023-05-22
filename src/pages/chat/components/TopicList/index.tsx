import { useAutoAnimate } from '@formkit/auto-animate/react';
import { robotsActions, useRobots } from '@/pages/chat/stores/robots';
import Item from './components/Item';

import { appSettingActions } from '@/stores/setting';
import { emit } from '@tauri-apps/api/event';
import { Events } from '@/enum/events';

export type TopicListProps = {};
const TopicList = ({}: TopicListProps) => {
  const { robots, currentRobotId, filter } = useRobots();
  const [parent] = useAutoAnimate(/* optional config */);
  return (
    <div ref={parent} className="overflow-y-auto overflow-x-hidden">
      {robots
        .filter((robot) => {
          if (filter) {
            return robot.name.includes(filter);
          }
          return true;
        })
        // 根据createdDate排序
        .sort((a, b) => {
          return b.createdDate - a.createdDate;
        })
        .map((robot) => {
          return (
            <Item
              key={robot.id}
              robot={robot}
              active={robot.id === currentRobotId}
              onClick={async () => {
                robotsActions.setCurrentRobotId(robot.id);
                robotsActions.addOpenedRobot(robot.id);
                appSettingActions.toggleSetting(false);
                await emit(Events.currentRobotChanged, {
                  robotId: robot.id,
                });
              }}
              onRemove={() => {
                robotsActions.removeRobot(robot.id);
              }}
            />
          );
        })}
    </div>
  );
};

export default TopicList;
