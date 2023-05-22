import { getRobotTag } from '@/pages/chat/_util';
import { Robot, RobotId, useRobot } from '@/pages/chat/stores/robots';
import { Avatar } from 'antd';
import {
  Menu,
  Item as MenuItem,
  Separator,
  useContextMenu,
} from 'react-contexify';

type ItemProps = {
  robot: Robot;
  active: boolean;
  onClick: (robotId: RobotId) => void;
  onRemove: (robotId: RobotId) => void;
};
const Item = ({ robot, active, onRemove, onClick }: ItemProps) => {
  const { show } = useContextMenu({
    id: robot.id,
  });

  return (
    <>
      <div
        onContextMenu={(event) => {
          show({
            event,
            props: {
              key: 'value',
            },
          });
        }}
        className={`flex p-3 cursor-pointer hover:bg-slate-100 w-full ${
          active ? 'bg-slate-100' : ''
        }`}
        key={robot.id}
        onClick={() => {
          onClick(robot.id);
        }}
      >
        <Avatar size="large" className="flex-none mr-2" src={robot.avatar} />
        <div className="flex-auto truncate">
          <div>{robot.name}</div>
          <div className="text-xs text-slate-500 truncate w-full text-truncate">
            {getRobotTag(robot.type)}
          </div>
        </div>
        <Menu id={robot.id}>
          <MenuItem
            id="delete"
            onClick={({ id, event, props }) => {
              switch (id) {
                case 'delete':
                  setTimeout(() => {
                    onRemove(robot.id);
                  }, 500);

                  break;
                case 'cut':
                  console.log(event, props);
                  break;
                //etc...
              }
            }}
          >
            Delete
          </MenuItem>
          <Separator />
          <MenuItem disabled>Disabled</MenuItem>
        </Menu>
      </div>
    </>
  );
};

export default Item;
