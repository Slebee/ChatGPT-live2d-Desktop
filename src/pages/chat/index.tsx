import CommonChat from './components/CommonChat';
import TopicList from './components/TopicList';
// @ts-ignore
import { Allotment } from 'allotment';
import { robotsActions, useRobots } from './stores/robots';
import { Alert, Empty } from 'antd';
import TopicListActions from './components/TopicListActions';
import { useEffect, useRef, useState } from 'react';
import useUpdateEffect from '@/hooks/useUpdateEffect';
import { useAppSetting } from '@/stores/setting';
import { listen } from '@tauri-apps/api/event';
import Search from './components/TopicList/components/Search';
import { Events } from '@/enum/events';
import { setShadow } from '@/utils/shadow';
import ExtraActions from '@/components/WindowContainer/components/ExtraActions';
import { debounce } from '@/utils';
import type { Robot } from './stores/robots';
import { RobotType } from '@/enum/robot';
import { UnListenEventsManager } from '@/object/UnListenEventsManager';
import { PoeSocket } from '@/object/PoeSocket';
import { getPoeBots } from '@/poe';

const defaultSizes = [200, 500];
function reload() {
  window.location.reload();
}
const debounceReload = debounce(reload, 500);
enum PoeServerStatusEnum {
  Idle = '',
  Connecting = 'connecting',
  Connected = 'connected',
  Disconnected = 'disconnected',
}
const tipsRender = (
  robot: Robot,
  status: PoeServerStatusEnum,
  err?: string,
) => {
  if (robot.type !== RobotType.POE) {
    return null;
  }
  if (status === PoeServerStatusEnum.Connected) {
    return null;
  }
  return (
    <Alert
      banner
      showIcon={false}
      className="absolute w-full top-0 z-10 pt-1 pb-1"
      description={
        status === PoeServerStatusEnum.Disconnected ? (
          <span className="text-red-700">{err}</span>
        ) : (
          status
        )
      }
    />
  );
};
const ChatPage = () => {
  const { openedRobots, robots, currentRobotId, fullScreenRobot } = useRobots();
  const [setting] = useAppSetting();
  const [poeServerStatus, setPoeServerStatus] = useState<PoeServerStatusEnum>(
    PoeServerStatusEnum.Idle,
  );
  const [poeServerErrorMessage, setPoeServerErrorMessage] = useState('');
  const allotmentRef = useRef<any>(null);

  const initPoeRobots = () => {
    getPoeBots()
      .then((res) => {
        if (res.data.status === 'success') {
          const poeRobots: Robot[] = [];
          console.log('bots:', res.data.bots);
          res.data.bots.forEach((bot) => {
            const robot = robots.find((r) => r.botId === bot.botId);
            if (robot) {
              // update
              robotsActions.updateRobotById(robot.botId, {
                ...bot,
                isPoeBot: true,
              });
            } else {
              poeRobots.push({
                ...bot,
                createdDate: Date.now(),
                streamed: true,
                type: RobotType.POE,
                isPoeBot: true,
              });
            }
          });
          robotsActions.addRobots(poeRobots);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useUpdateEffect(() => {
    if (!fullScreenRobot) {
      allotmentRef.current?.resize(defaultSizes);
    }
  }, [fullScreenRobot]);

  useEffect(() => {
    const unListenEventsManager = new UnListenEventsManager();
    async function listenChange() {
      unListenEventsManager.addEvent(
        await listen(Events.settingChanged, () => {
          debounceReload();
        }),
      );
    }
    listenChange();
    setShadow('chat');
    return () => {
      unListenEventsManager.clearEvents();
    };
  }, []);

  useEffect(() => {
    async function initPoe() {
      if (setting.poe.enabled) {
        setPoeServerStatus(PoeServerStatusEnum.Connecting);
        try {
          await PoeSocket.connect({
            onConnect: () => {
              setPoeServerStatus(PoeServerStatusEnum.Connected);
            },
            onDisconnect: () => {
              setPoeServerStatus(PoeServerStatusEnum.Disconnected);
            },
            onFail: () => {
              setPoeServerStatus(PoeServerStatusEnum.Disconnected);
            },
          });
          initPoeRobots();
        } catch (err: any) {
          setPoeServerErrorMessage(err.message);
        }
      }
    }
    initPoe();
    return () => {
      PoeSocket.disconnect();
    };
  }, [setting.poe.enabled]);

  const showEmpty = currentRobotId === undefined && !setting.basic.opened;

  return (
    <div className="flex w-full h-full">
      <Allotment ref={allotmentRef} defaultSizes={defaultSizes}>
        {!fullScreenRobot && (
          <Allotment.Pane priority={1} className="transition-all" minSize={60}>
            <div className="flex flex-col h-full justify-space-between">
              <Search />
              <div className="flex-auto overflow-y-auto">
                <TopicList />
              </div>
              <TopicListActions />
            </div>
          </Allotment.Pane>
        )}

        <Allotment.Pane priority={2} className="transition-all" minSize={200}>
          <div className="w-full h-full flex flex-col">
            <ExtraActions
              windowName="chat"
              className={`p-1 pb-0 ${showEmpty ? 'flex-none' : 'flex-auto'}`}
            />
            {showEmpty ? (
              <Empty className="mt-5" />
            ) : (
              <div className="w-full h-full relative transition transition-transform ">
                {openedRobots.map((robotId) => {
                  const robot = robots.find((r) => r.botId === robotId)!;

                  if (!robot) {
                    return null;
                  }
                  if (!setting.poe.enabled && robot.isPoeBot) {
                    return null;
                  }
                  return (
                    <CommonChat
                      key={robotId}
                      robot={robot}
                      tips={tipsRender(
                        robot,
                        poeServerStatus,
                        poeServerErrorMessage,
                      )}
                      className={
                        currentRobotId === robot.botId && !setting.basic.opened
                          ? 'flex'
                          : 'w-0 h-0 hidden'
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};

export default ChatPage;
