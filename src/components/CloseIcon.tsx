import { CloseCircleOutlined } from '@ant-design/icons';
import { Button, ButtonProps } from 'antd';

export default (props: ButtonProps) => (
  <Button
    type="primary"
    shape="circle"
    icon={<CloseCircleOutlined />}
    {...props}
    style={{
      border: 'none',
      ...props.style,
    }}
  />
);
