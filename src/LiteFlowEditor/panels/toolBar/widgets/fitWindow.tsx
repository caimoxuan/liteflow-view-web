import React from 'react';

import { Graph } from '@antv/x6';
import makeBtnWidget from './common/makeBtnWidget';
import { LayoutOutlined } from '@ant-design/icons';
import { MAX_ZOOM, MIN_ZOOM } from '../../../constant';

interface IProps {
  flowGraph: Graph;
}

const FitWindow: React.FC<IProps> = makeBtnWidget({
  tooltip: '适配窗口',
  getIcon() {
    return <LayoutOutlined />;
  },
  handler(flowGraph: Graph) {
    flowGraph.zoomToFit({ minScale: MIN_ZOOM, maxScale: MAX_ZOOM });
  },
});

export default FitWindow;
