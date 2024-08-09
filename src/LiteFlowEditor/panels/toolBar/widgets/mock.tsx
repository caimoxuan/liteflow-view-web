import React, { useState, useEffect } from 'react';
import { Graph } from '@antv/x6';
import { Select } from 'antd';
import ELBuilder from '../../../model/builder';
import { MIN_ZOOM } from '../../../constant';
import { setModel } from '../../../hooks/useModel';
import { history } from '../../../hooks/useHistory';
import styles from './index.module.less';
import { getRequest } from '../../../utils/httpUtils';

interface IProps {
  flowGraph: Graph;
}

const Mock: React.FC<IProps> = (props) => {
  const { flowGraph } = props;
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [chainOptions, setChainOptions] = useState<any[]>([]);

  const handleOnChange = (value: string) => {
    getChainDetail(value);
    setSelectedValue(value);
  };

  const getChainDetail = (cinaId: string) => {
    getRequest("http://localhost:10005/v1/liteflow/api/chainDetail?chainId=" + cinaId).then((res) => {
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
    })
  }

  const getAllChain = () => {
    getRequest("http://localhost:10005/v1/liteflow/api/chainList").then((res) => {
        let options: any[] = [];
        for (let opt of res) {
          options.push({
            label: opt.chainName,
            value: opt.chainId,
          })
        }
        setChainOptions(options);
    }).catch(err => {
      console.log(err);
    })
  }

  useEffect(() => {
    getAllChain();
  }, [flowGraph]);

  return (
    <div className={styles.zoomContainer} style={{ margin: '0 8px' }}>
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
