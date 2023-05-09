import { useAutoAnimate } from '@formkit/auto-animate/react';
import { robotsActions, useRobots } from '@/pages/chat/stores/robots';
import Item from './components/Item';

import { appSettingActions } from '@/stores/setting';

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
              id={robot.id}
              robot={robot}
              active={robot.id === currentRobotId}
              onClick={() => {
                robotsActions.setCurrentRobotId(robot.id);
                robotsActions.addOpenedRobot(robot.id);
                appSettingActions.toggleSetting(false);
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
