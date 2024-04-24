import { Graph } from '@antv/x6';
import LiteFlowEditor from '../component/LiteFlowEditor';
import styles from './index.less';

const onReady = (flowGraph: Graph): void => {
  console.log(flowGraph);
};

export default function IndexPage() {
  return (
    <div className={styles.container}>
      <LiteFlowEditor onReady={onReady} />
    </div>
  );
}
