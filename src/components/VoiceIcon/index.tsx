import { VitsStatusEnum } from '@/pages/chat/hooks/useVits';
import { LoadingOutlined, PlayCircleOutlined } from '@ant-design/icons';

type VoiceIconProps = {
  status: VitsStatusEnum;
  onPlay?: () => void;
  onPaused?: () => void;
};
const VoiceIcon = ({ status, onPlay, onPaused }: VoiceIconProps) => {
  if (status === VitsStatusEnum.waiting) {
    return (
      <LoadingOutlined className="absolute w-5 text-lg right-[-25px] top-[7px] cursor-pointer text-gray-400 hover:text-gray-500 transition-colors" />
    );
  }
  if (status === VitsStatusEnum.playing) {
    return (
      <div
        className="absolute voice-icon-container h-3 right-[-35px] top-[8px] cursor-pointer"
        onClick={onPaused}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="voice-icon-bar" />
        ))}
      </div>
    );
  }
  return (
    <PlayCircleOutlined
      onClick={onPlay}
      className="absolute w-5 text-lg right-[-25px] top-[7px] cursor-pointer text-gray-400 hover:text-gray-500 transition-colors"
    />
  );
};

export default VoiceIcon;
