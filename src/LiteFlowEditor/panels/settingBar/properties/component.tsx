import React, { useEffect, useState } from 'react';
import { Button, Form, Input, List, Divider, Drawer, Select, message } from 'antd';
import { debounce, update } from 'lodash';
import { history } from '../../../hooks/useHistory';
import ELNode from '../../../model/node';
import styles from './index.module.less';
import {  getExtensionDetail, getNodeDetail, updateExtension, createExtension } from "../../../constant/api/index"
import { CmpInfo } from '../../../common/store';
import CodeMirror from '@uiw/react-codemirror'
import {formatter, placeholderScript } from '../../../constant/script'

interface IProps {
  model: ELNode;
}

const { Search } = Input;

const ComponentPropertiesEditor: React.FC<IProps> = (props) => {
  const { model } = props;
  const properties = model.getProperties();

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [extensionInfos, setExtensionInfos] = useState<any[]>([]);
  const [cmpInfoList, setCmpLists] = useState<any[]>([]);
  const [shouldUpdate, setShouldUpdate] = useState<Boolean>(false);
  const [currentExtension, setCurrentExtension] = useState<any>({});
  const [showExtensionDrawer, setShowExtensionDrawer] = useState<boolean>(false);
  

  const formData = {
    id: model.id,
    properties: properties,
  }

  // 抽屉控制
  const extensionInfoDrawerOpen = (item: any) => {
    setCurrentExtension(item);
    setShowExtensionDrawer(true);
  }

  const extensionInfoDrawerClose = () => {
    setShowExtensionDrawer(false);
  }

  // 脚本语言选择
  const lanChange = (value: string) => {
    let updateExtension = currentExtension;
    updateExtension.scriptType = value;
    // 格式化默认代码
    let code = placeholderScript[value];
    if (code) {
      let name = currentExtension.extCode + "_" + currentExtension.bizCode;
      code = formatter(code, name);
      updateExtension.scriptText = code;
    }
    setCurrentExtension({...updateExtension});
  }

  const operatorExtensionInfo = () => {
    console.log(currentExtension);
    if (!currentExtension) {
      return;
    }
    let data: any = {
      bizCode: currentExtension.bizCode,
      extCode: currentExtension.extCode,
      scriptDetail: {
        scriptText: currentExtension.scriptText,
        scriptType: currentExtension.scriptType || 'lua',
      }
    }
    if (shouldUpdate) {
      updateExtension(data).then((res) => {
        if (res === "success") {
          extensionInfoDrawerClose();
        } else {
          messageApi.error("修改扩展点失败:" + res);
        }
      }).catch(err => {
        console.log(err);
        messageApi.error("修改扩展点失败:" + err.response?.data?.message);
      })
    } else {
      createExtension(data).then((res) => {
        if (res === "success") {
          extensionInfoDrawerClose();
        } else {
          messageApi.error("新增扩展点失败:" + res);
        }
      }).catch(err => {
        console.log(err);
        messageApi.error("新增扩展点失败:" + err.response?.data?.message);
      })
    }
  }

  // 扩展点信息加载
  const loadExtensionInfo = (loadKey: string) => {
    getExtensionDetail({bizCode: loadKey, extCode: currentExtension.extCode}).then((res) => {
      setCurrentExtension({
        bizCode: res.bizCode,
        extCode: res.extensionInfo?.extCode,
        extDesc: currentExtension.extDesc,
        scriptText: res.scriptText || '',
        scriptType: res.scriptType || 'lua',
      })
      setShouldUpdate(res.scriptText ? true : false);
    }).catch(err => {
      messageApi.error("查询扩展点失败:" + err.response?.data?.message);
    })
  }

  const handleSearch = (value: string) => {
    if (value.length > 0) {
      loadExtensionInfo(value);
    }
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
    CmpInfo.getCmpList().then(res => {
      setCmpLists(res);
    })
    if (model.getExtensions() > 0) {
      getNodeDetail({nodeId: model.id}).then((res) => {
        setExtensionInfos(res.extensions);
      }).catch(err => {
        console.log(err);
        messageApi.error("查询扩展详情失败:" + err.response?.data?.message);
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
          <Select 
            options={cmpInfoList.map(c => {
              return {
                value: c.cmpId,
                label: c.cmpId
              }
            })}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
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
                <List.Item.Meta title={<a onClick={() => extensionInfoDrawerOpen(item)}>{item.extDesc}</a>} />
              </List.Item>
            )}
            >
            </List>
        </div>
        : <></>
      }
      <Drawer title={currentExtension.extDesc} onClose={extensionInfoDrawerClose} open={showExtensionDrawer} size='large'>
        <p>扩展点编码：{currentExtension.extCode}</p>
        <Search placeholder="查询扩展点" value={currentExtension.bizCode} onSearch={handleSearch} enterButton />
        <Divider>扩展点脚本信息</Divider>
        <CodeMirror
            value={currentExtension.scriptText}
            height='600px'
            theme={'dark'}
            onChange={(value, viewupdate) => {
              setCurrentExtension({
                ...currentExtension,
                scriptText: value
              });
            }}
          />
          <Select
            defaultValue={currentExtension.scriptType || 'lua'}
            value={currentExtension.scriptType}
            style={{ width: 120, marginTop: 10 }}
            onChange={lanChange}
            options={[
              { value: 'lua', label: 'lua' },
              { value: 'java', label: 'java' },
              { value: 'javascript', label: 'javascript' },
              { value: 'groovy', label: 'groovy' },
            ]}
          />
          <Divider />
          <Button onClick={operatorExtensionInfo}>保存脚本</Button>
      </Drawer>
      {contextHolder}
    </div>
  );
};

export default ComponentPropertiesEditor;
