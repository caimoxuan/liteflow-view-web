import React from 'react';
import { Form, Input } from 'antd';
import { debounce } from 'lodash';
import { history } from '../../../hooks/useHistory';
import ELNode from '../../../model/node';
import styles from './index.module.less';

interface IProps {
  model: ELNode;
}

const ConditionPropertiesEditor: React.FC<IProps> = (props) => {
  const { model } = props;
  const properties = model.getProperties();

  const [form] = Form.useForm();

  const handleOnChange = debounce(async () => {
    try {
      const changedValues = await form.validateFields();
      model.setProperties({ ...properties, ...changedValues });
      history.push(undefined, { silent: true });
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  }, 200);

  return (
    <div className={styles.liteflowEditorPropertiesEditorContainer}>
      <Form
        layout="vertical"
        form={form}
        initialValues={{ ...properties }}
        onValuesChange={handleOnChange}
      >
        <Form.Item name="id" label="唯一标识（id）">
          <Input allowClear />
        </Form.Item>
        <Form.Item name="tag" label="标签（tag）">
          <Input allowClear />
        </Form.Item>
      </Form>
    </div>
  );
};

export default ConditionPropertiesEditor;
