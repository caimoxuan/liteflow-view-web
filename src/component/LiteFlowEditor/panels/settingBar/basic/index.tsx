import React, { useEffect, useState } from 'react';
import { Graph, Cell } from '@antv/x6';
import { Select } from 'antd';
import { forceLayout } from '../../../common/layout';
import mocks from '../../../mock';
import builder from '../../../model/builder';
import styles from './index.module.less';
import { ConditionTypeEnum } from '../../../constant';

interface IProps {
  flowChart: Graph;
}

const Basic: React.FC<IProps> = (props) => {
  const { flowChart } = props;

  const [selectedValue, setSelectedValue] = useState<string>(
    ConditionTypeEnum.THEN,
  );
  const [elString, setELString] = useState<string>('');

  const handleOnChange = (value: string = selectedValue) => {
    const mockData = mocks[value] as any;
    const model = builder(mockData);
    const modelJSON = model.toCells() as Cell[];
    flowChart.scroller.disableAutoResize();
    flowChart.startBatch('update');
    flowChart.resetCells(modelJSON);
    forceLayout(flowChart);
    flowChart.stopBatch('update');
    flowChart.scroller.enableAutoResize();

    setELString(model.toEL());
    setSelectedValue(value);
  };

  useEffect(() => {
    handleOnChange(ConditionTypeEnum.THEN);
  }, []);

  useEffect(() => {
    flowChart.on('model:change', handleOnChange);
    return () => {
      flowChart.off('model:change', handleOnChange);
    };
  }, [flowChart, handleOnChange]);

  return (
    <div className={styles.liteflowEditorBasicContainer}>
      <Select
        value={selectedValue}
        style={{ width: 200 }}
        onChange={handleOnChange}
        options={[
          {
            label: '顺序类',
            options: [
              { label: '串行编排(THEN)', value: ConditionTypeEnum.THEN },
              { label: '并行编排(WHEN)', value: ConditionTypeEnum.WHEN },
            ],
          },
          {
            label: '分支类',
            options: [
              {
                label: '选择编排(SWITCH)',
                value: ConditionTypeEnum.SWITCH,
              },
              { label: '条件编排(IF)', value: ConditionTypeEnum.IF },
            ],
          },
          {
            label: '循环类',
            options: [
              { label: 'FOR循环', value: ConditionTypeEnum.FOR },
              { label: 'WHILE循环', value: ConditionTypeEnum.WHILE },
            ],
          },
        ]}
      />
      <div className={styles.elContentWrapper}>{elString}</div>
    </div>
  );
};

export default Basic;
