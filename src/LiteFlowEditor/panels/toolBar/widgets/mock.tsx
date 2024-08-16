import React, { useState, useEffect } from 'react';
import { Graph } from '@antv/x6';
import { Select, message } from 'antd';
import ELBuilder from '../../../model/builder';
import { MIN_ZOOM } from '../../../constant';
import { setModel } from '../../../hooks/useModel';
import { history } from '../../../hooks/useHistory';
import styles from './index.module.less';
import { getChainDetail, getChainList } from '../../../constant/api';

interface IProps {
  flowGraph: Graph;
}

const Mock: React.FC<IProps> = (props) => {
  const { flowGraph } = props;
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [chainOptions, setChainOptions] = useState<any[]>([]);

  const [messageApi, contextHolder] = message.useMessage()

  const handleOnChange = (value: string) => {
    getChainDetails(value);
    setSelectedValue(value);
  };

  const getChainDetails = (cinaId: string) => {
    getChainDetail({chainId: cinaId}).then((res) => {
      let data : any = {
        "type": res.type,
        "children": res.children,
        "properties": res.properties,
        "condition": res.condition,
      }
      const model = ELBuilder.build(data || {});
      setModel(model);
      history.cleanHistory();
      flowGraph.zoomToFit({ minScale: MIN_ZOOM, maxScale: 1 });
    }).catch(err => {
      console.log(err);
      messageApi.error("查询流程详情失败:" + err.response?.data?.message);
    })
  }

  const getAllChain = () => {
    getChainList().then((res) => {
        let options: any[] = [];
        for (let opt of res) {
          options.push({
            label: opt.chainName,
            value: opt.chainId,
          })
        }
        setChainOptions(options);
    }).catch(err => {
      messageApi.error("查询流程列表失败:" + err.response?.data?.message);
    })
  }

  useEffect(() => {
    getAllChain();
  }, [flowGraph]);

  return (
    <div className={styles.zoomContainer} style={{ margin: '0 8px' }}>
      { contextHolder }
      <span>流程数据：</span>
      <Select
        placeholder="请选择流程数据"
        value={selectedValue}
        style={{ width: 200 }}
        onChange={handleOnChange}
        options={chainOptions}
      />
    </div>
  );
};

export default Mock;
