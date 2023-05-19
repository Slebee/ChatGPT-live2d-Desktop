import CommonChat from './components/CommonChat';
import TopicList from './components/TopicList';
// @ts-ignore
import { Allotment } from 'allotment';
import { useRobots } from './stores/robots';
import { Empty } from 'antd';
import TopicListActions from './components/TopicListActions';
import { useEffect, useRef } from 'react';
import useUpdateEffect from '@/hooks/useUpdateEffect';
import { useAppSetting } from '@/stores/setting';
import { listen } from '@tauri-apps/api/event';
import Search from './components/TopicList/components/Search';
import { Events } from '@/enum/events';
import { setShadow } from '@/utils/shadow';
import ExtraActions from '@/components/WindowContainer/components/ExtraActions';
import { debounce } from '@/utils';

const defaultSizes = [200, 500];
function reload() {
  window.location.reload();
}
const debounceReload = debounce(reload, 500);
const ChatPage = () => {
  const { openedRobots, robots, currentRobotId, fullScreenRobot } = useRobots();
  const [setting] = useAppSetting();
  const allotmentRef = useRef<any>(null);
  useUpdateEffect(() => {
    if (!fullScreenRobot) {
      allotmentRef.current?.resize(defaultSizes);
    }
  }, [fullScreenRobot]);
  useEffect(() => {
    let unlisten: () => void;
    async function listenChange() {
      unlisten = await listen(Events.settingChanged, () => {
        debounceReload();
      });
    }
    listenChange();
    setShadow('chat');
    return () => {
      unlisten?.();
    };
  }, []);
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
                  const robot = robots.find((r) => r.id === robotId)!;
                  if (!robot) {
                    return null;
                  }
                  return (
                    <CommonChat
                      key={robotId}
                      robot={robot}
                      className={
                        currentRobotId === robot.id && !setting.basic.opened
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
