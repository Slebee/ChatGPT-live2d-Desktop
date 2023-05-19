import { Robot, robotsActions } from '@/pages/chat/stores/robots';
import {
  Col,
  Form,
  Input,
  InputRef,
  Modal,
  Row,
  Select,
  Slider,
  Space,
  Switch,
  Tooltip,
} from 'antd';
import { FormattedMessage } from 'umi';
import React, { useEffect, useRef, useState } from 'react';
import AvatarSelect from './AvatarSelect';
import { fetchSpeakers } from '@/services';
import { Speaker } from '@/types';
import { QuestionCircleOutlined, SoundOutlined } from '@ant-design/icons';
import { Vits } from '@/object/tts/Vits';
import { chatActionsFactory } from '@/pages/chat/stores/chats';
import { RobotType } from '@/enum/robot';

type FormValues = {
  name: string;
  description: string;
  avatar: string;
  speakerId: number;
  vitsNoise: number;
  vitsLength: number;
  type: RobotType;
  channelId: string;
  baiduTranslateFrom: string;
  baiduTranslateTo: string;
  baiduTranslateEnabled: boolean;
};
type AddTopicModalProps = {
  children: React.ReactNode;
  onSubmit?: () => void;
  initialValues?: Partial<Robot>;
  title?: React.ReactNode;
};
const AddTopicModal = ({
  children,
  onSubmit,
  initialValues,
  title,
}: AddTopicModalProps) => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState<boolean>(false);
  const inputRef = useRef<InputRef>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [acts, setActs] = useState<{ act: string; prompt: string }[]>([]);
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      fetchSpeakers().then((res) => {
        setSpeakers(res.data.VITS);
      });
    }
  }, [visible]);
  useEffect(() => {
    const getActs = async () => {
      const res = await fetch('/acts.json');
      const data = await res.json();
      setActs(data);
    };
    getActs();
  }, []);
  return (
    <>
      <span
        onClick={() => {
          setVisible(true);
        }}
      >
        {children}
      </span>
      <Modal
        centered
        bodyStyle={{
          maxHeight: 500,
          overflowY: 'auto',
          paddingRight: 10,
        }}
        onCancel={() => {
          setVisible(false);
        }}
        open={visible}
        maskClosable={false}
        title={title ?? <FormattedMessage id="chat.form.newChat" />}
        afterClose={() => {
          form.resetFields();
        }}
        destroyOnClose
        onOk={() => {
          form
            .validateFields()
            .then((values: FormValues) => {
              const speaker = speakers.find(
                (speaker) => speaker.id === values.speakerId,
              );
              const data = {
                name: values.name,
                description: values.description,
                introduction: values.description,
                avatar: values.avatar,
                type: values.type,
                vits: {
                  speaker,
                  noise: values.vitsNoise,
                  length: values.vitsLength,
                  enabled: true,
                },
                claude: {
                  channelId: values.channelId,
                },
                baiduTranslate: {
                  enabled: values.baiduTranslateEnabled,
                  from: values.baiduTranslateFrom,
                  to: values.baiduTranslateTo,
                },
              };
              onSubmit?.();
              if (initialValues) {
                robotsActions.updateRobotById(initialValues.id!, data);
                chatActionsFactory(initialValues.id!).updateSystemMessage({
                  content: data.description,
                });
              } else {
                robotsActions.addRobot({
                  id: new Date().getTime(),
                  createdDate: new Date().getTime(),
                  ...data,
                });
              }
              setVisible(false);
            })
            .catch((info) => {
              console.log('Validate Failed:', info);
            });
        }}
      >
        <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
          <Form.Item
            label={<FormattedMessage id="chat.form.name" />}
            name="name"
            initialValue={initialValues?.name}
            rules={[
              {
                required: true,
                message: 'Please input your botName!',
              },
            ]}
          >
            <Input autoFocus ref={inputRef} />
          </Form.Item>
          <Form.Item
            label={<FormattedMessage id="chat.form.avatar" />}
            name="avatar"
            initialValue={initialValues?.avatar ?? '/avatars/mdg.png'}
          >
            <AvatarSelect />
          </Form.Item>
          <Form.Item
            label={<FormattedMessage id="chat.form.robotType" />}
            name="type"
            initialValue={initialValues?.type || RobotType.GPT}
          >
            <Select
              options={[
                {
                  label: 'GPT',
                  value: RobotType.GPT,
                },
                {
                  label: 'Claude',
                  value: RobotType.CLAUDE,
                },
              ]}
            />
          </Form.Item>
          <Form.Item noStyle dependencies={['type']}>
            {({ getFieldValue }) => {
              if (getFieldValue('type') === RobotType.CLAUDE) {
                return (
                  <Form.Item
                    label={<FormattedMessage id="chat.form.claude.channelId" />}
                    name="channelId"
                    initialValue={
                      initialValues?.claude?.channelId ?? 'chat-7879'
                    }
                  >
                    <Input />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

          <Form.Item
            label={<FormattedMessage id="chat.form.voice" />}
            name="speakerId"
            initialValue={initialValues?.vits?.speaker?.id}
          >
            <Select
              showSearch
              filterOption={(input, option) => {
                return (
                  speakers.find((speaker) => speaker.id === option?.value)
                    ?.name ?? ''
                )
                  .toLowerCase()
                  .includes(input.toLowerCase());
              }}
              showArrow={false}
            >
              {speakers.map((speaker) => {
                return (
                  <Select.Option key={speaker.id} value={speaker.id}>
                    <Row>
                      <Col flex="auto">{speaker.name}</Col>
                      <Col
                        className="cursor-pointer"
                        flex="none"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const vitsSpeaker = new Vits({
                            id: speaker.id,
                            noise: form.getFieldValue('vitsNoise'),
                            length: form.getFieldValue('vitsLength'),
                            text: `你好，我是${speaker.name}`,
                          });
                          vitsSpeaker.speak({
                            translate: false,
                          });
                        }}
                      >
                        <SoundOutlined />
                      </Col>
                    </Row>
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item noStyle dependencies={['speakerId']}>
            {({ getFieldValue }) => {
              if (getFieldValue('speakerId') === undefined) return null;
              return (
                <>
                  <Form.Item
                    name="vitsNoise"
                    label={
                      <Tooltip
                        title={
                          <FormattedMessage id="chat.form.vits.noise.description" />
                        }
                      >
                        <Space>
                          <FormattedMessage id="chat.form.vits.noise" />
                          <QuestionCircleOutlined />
                        </Space>
                      </Tooltip>
                    }
                    initialValue={initialValues?.vits?.noise || 0.2}
                  >
                    <Slider min={0.0} max={2.0} step={0.1} className="w-full" />
                  </Form.Item>
                  <Form.Item
                    name="vitsLength"
                    label={
                      <Tooltip
                        title={
                          <FormattedMessage id="chat.form.vits.length.description" />
                        }
                      >
                        <Space>
                          <FormattedMessage id="chat.form.vits.length" />
                          <QuestionCircleOutlined />
                        </Space>
                      </Tooltip>
                    }
                    initialValue={initialValues?.vits?.length || 1.2}
                  >
                    <Slider min={0.1} max={2.0} step={0.1} className="w-full" />
                  </Form.Item>
                  <Form.Item
                    label={
                      <FormattedMessage id="chat.form.baiduTranslate.enabled" />
                    }
                    name="baiduTranslateEnabled"
                    initialValue={
                      initialValues?.baiduTranslate?.enabled ?? false
                    }
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <Form.Item noStyle dependencies={['baiduTranslateEnabled']}>
                    {({ getFieldValue }) => {
                      if (!getFieldValue('baiduTranslateEnabled')) return null;
                      return (
                        <>
                          <Form.Item
                            label={
                              <FormattedMessage id="chat.form.baiduTranslate.from" />
                            }
                            name="baiduTranslateFrom"
                            initialValue={
                              initialValues?.baiduTranslate?.from || 'zh'
                            }
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            label={
                              <FormattedMessage id="chat.form.baiduTranslate.to" />
                            }
                            name="baiduTranslateTo"
                            initialValue={
                              initialValues?.baiduTranslate?.to || 'zh'
                            }
                          >
                            <Input />
                          </Form.Item>
                        </>
                      );
                    }}
                  </Form.Item>
                </>
              );
            }}
          </Form.Item>

          <Form.Item noStyle dependencies={['type']}>
            {({ getFieldValue }) => {
              if (getFieldValue('type') === RobotType.GPT) {
                return (
                  <>
                    <Form.Item
                      label={<FormattedMessage id="chat.form.reference" />}
                      name="reference"
                    >
                      <Select
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? '')
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        onChange={(v) => {
                          form.setFieldValue('description', v);
                        }}
                        options={acts.map((act) => ({
                          label: act.act,
                          value: act.prompt,
                        }))}
                        allowClear
                      />
                    </Form.Item>
                    <Form.Item
                      label={<FormattedMessage id="chat.form.description" />}
                      name="description"
                      initialValue={initialValues?.description}
                    >
                      <Input.TextArea
                        rows={4}
                        style={{
                          resize: 'none',
                        }}
                      />
                    </Form.Item>
                  </>
                );
              }
              return null;
            }}
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddTopicModal;
