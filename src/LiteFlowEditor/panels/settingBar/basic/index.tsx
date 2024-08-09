import React, { useEffect, useState } from 'react';
import { Graph } from '@antv/x6';
import { message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useModel } from '../../../hooks/useModel';
import styles from './index.module.less';

interface IProps {
  flowGraph: Graph;
}

const Basic: React.FC<IProps> = (props) => {
  const { flowGraph } = props;
  const [elString, setELString] = useState<string>(useModel()?.toEL(' '));

  useEffect(() => {
    const handleModelChange = () => {
      setELString(useModel()?.toEL(' '));
    };
    flowGraph.on('model:change', handleModelChange);
    return () => {
      flowGraph.off('model:change', handleModelChange);
    };
  }, [flowGraph, setELString]);

  const [messageApi, contextHolder] = message.useMessage();
  const copyElStr = async () => {
    try {
      await navigator.clipboard.writeText(elString);
      messageApi.success("复制成功");
    } catch(e) {
      console.log(e);
      messageApi.success("复制失败");
    }
  }

  return (
    <>
      {contextHolder}
      <div className={styles.liteflowEditorBasicContainer}>
        <div className={styles.elContentWrapper}>
          <pre>{elString}</pre>
          {elString ? <CopyOutlined onClick={copyElStr} /> : <></>}
        </div>
      </div>
    </>
  );
};

export default Basic;
