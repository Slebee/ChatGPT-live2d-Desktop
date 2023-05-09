import { robotsActions } from '@/pages/chat/stores/robots';
import AddTopicModal from './AddTopicModal';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Icon from '@/components/Icon';
import { Input } from 'antd';

const Search = () => {
  return (
    <div className="p-2 pt-3 pb-3 flex justify-between">
      <div className="font-bold leading-8">
        <Input
          className="text-slate-400 hover:text-slate-800"
          prefix={<SearchOutlined />}
          onChange={(e) => {
            robotsActions.setFilter(e.target.value);
          }}
          allowClear
        />
      </div>
      <AddTopicModal>
        <Icon className="hover:bg-transparent">
          <PlusOutlined className="cursor-pointer" />
        </Icon>
      </AddTopicModal>
    </div>
  );
};

export default Search;
