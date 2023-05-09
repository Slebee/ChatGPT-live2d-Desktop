import { Button } from 'antd';

const NavIcon = ({
  onClick,
  icon,
}: {
  onClick?: () => void;
  icon?: React.ReactNode;
}) => (
  <Button
    type="primary"
    shape="circle"
    className="bg-sky-700 justify-center content-center flex flex-wrap hover:scale-125"
    onClick={onClick}
    icon={icon}
  />
);
export default NavIcon;
