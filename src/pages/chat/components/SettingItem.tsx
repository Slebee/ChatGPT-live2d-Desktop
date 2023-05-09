import { Col, Row } from 'antd';

const SettingItem = ({
  children,
  label,
  description,
}: {
  label: string | React.ReactNode;
  children: React.ReactNode;
  description?: string | React.ReactNode;
}) => {
  return (
    <Row className="pt-1 pb-1">
      <Col
        className="inline-block text-sm leading-7 text-current flex-auto"
        span={14}
      >
        <h3 className="font-medium">{label}</h3>
        {description && (
          <p className="mb-0 text-xs text-slate-500">{description}</p>
        )}
      </Col>
      <Col className="flex flex-wrap content-center" span={10}>
        {children}
      </Col>
    </Row>
  );
};

export default SettingItem;
