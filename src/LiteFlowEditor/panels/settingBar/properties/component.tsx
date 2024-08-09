import React, { useEffect, useState } from 'react';
import { Button, Form, Input, List, Divider } from 'antd';
import { debounce } from 'lodash';
import { history } from '../../../hooks/useHistory';
import ELNode from '../../../model/node';
import styles from './index.module.less';
import { getRequest } from "../../../utils/httpUtils"

interface IProps {
  model: ELNode;
}

const ComponentPropertiesEditor: React.FC<IProps> = (props) => {
  const { model } = props;
  const properties = model.getProperties();

  const [form] = Form.useForm();

  const [extensionInfos, setExtensionInfos] = useState<any[]>([]);

  const formData = {
    id: model.id,
    properties: properties,
  }

  const handleConfirm = debounce(async () => {
    history.push(undefined, {slient: true});
  }, 200);

  const handleOnChange = debounce(async () => {
    try {
      const changedValues = await form.validateFields();
      model.setProperties({ ...properties, ...changedValues.properties });
      model.setId(changedValues.id)
      history.push(undefined, { silent: true });
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  }, 200);

  useEffect(() => {
    if (model.getExtensions() > 0) {
      getRequest("http://localhost:10005/v1/liteflow/api/nodeDetail?nodeId=" + model.id).then((res) => {
        setExtensionInfos(res.extensions);
        console.log(res.extensions);
      }).catch(err => {
        console.log(err);
      })
    }
  }, [])

  return (
    <div className={styles.liteflowEditorPropertiesEditorContainer}>
      <Form
        layout="vertical"
        form={form}
        initialValues={{ ...formData }}
        onValuesChange={handleOnChange}
      >
        <Form.Item name="id" label="组件名">
          <Input allowClear />
        </Form.Item>
        <Form.Item name={['properties', 'tag']} label="标签（tag）">
          <Input allowClear />
        </Form.Item>
        <Form.Item>
          <Button onClick={handleConfirm}>保存</Button>
        </Form.Item>
      </Form>
      {
        model.getExtensions() > 0 ?
        <div>
          <Divider>扩展点信息</Divider>
          <List
            itemLayout="horizontal"
            dataSource={extensionInfos}
            renderItem={(item, index) => (
              <List.Item key={index}>
                <List.Item.Meta title={item.extDesc} />
              </List.Item>
            )}
            >
            </List>
        </div>
        : <></>
      }
    </div>
  );
};

export default ComponentPropertiesEditor;
