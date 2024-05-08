import { safeGet } from '../utils';
import { message, Modal } from 'antd';
import { Graph } from '@antv/x6';
import { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from '../constant';
import { getSelectedNodes } from '../utils/flowChartUtils';

interface Shortcut {
  keys: string | string[];
  handler: (flowGraph: Graph) => void;
}

export const shortcuts: { [key: string]: Shortcut } = {
  save: {
    keys: 'meta + s',
    handler(flowGraph: Graph) {
      console.log('save');
      console.log(flowGraph.toJSON());
      return false;
    },
  },
  undo: {
    keys: 'meta + z',
    handler(flowGraph: Graph) {
      flowGraph.undo();
      return false;
    },
  },
  redo: {
    keys: 'meta + shift + z',
    handler(flowGraph: Graph) {
      flowGraph.redo();
      return false;
    },
  },
  zoomIn: {
    keys: 'meta + shift + +',
    handler(flowGraph: Graph) {
      const nextZoom = (flowGraph.zoom() + ZOOM_STEP).toPrecision(2);
      flowGraph.zoomTo(Number(nextZoom), { maxScale: MAX_ZOOM });
      return false;
    },
  },
  zoomOut: {
    keys: 'meta + shift + -',
    handler(flowGraph: Graph) {
      const nextZoom = (flowGraph.zoom() - ZOOM_STEP).toPrecision(2);
      flowGraph.zoomTo(Number(nextZoom), { minScale: MIN_ZOOM });
      return false;
    },
  },
  copy: {
    keys: 'meta + c',
    handler(flowGraph: Graph) {
      const cells = flowGraph.getSelectedCells();
      if (cells.length > 0) {
        flowGraph.copy(cells);
        message.success('复制成功');
      }
      return false;
    },
  },
  paste: {
    keys: 'meta + v',
    handler(flowGraph: Graph) {
      if (!flowGraph.isClipboardEmpty()) {
        const cells = flowGraph.paste({ offset: 32 });
        flowGraph.cleanSelection();
        flowGraph.select(cells);
      }
      return false;
    },
  },
  delete: {
    keys: ['backspace', 'del'],
    handler(flowGraph: Graph) {
      const toDelCells = flowGraph
        .getSelectedCells()
        .filter((cell) => cell.isNode());
      if (toDelCells.length) {
        Modal.confirm({
          title: `确认要删除选中的节点？`,
          content: '点击确认按钮进行删除，点击取消按钮返回',
          onOk() {
            toDelCells.forEach((node) => {
              const { model } = node.getData() || {};
              model?.remove?.();
            });
            flowGraph.trigger('model:change');
          },
        });
      }
      return false;
    },
  },
  selectAll: {
    keys: 'meta + a',
    handler(flowGraph: Graph) {
      flowGraph.select(flowGraph.getCells());
      return false;
    },
  },
  bold: {
    keys: 'meta + b',
    handler(flowGraph: Graph) {
      const cells = flowGraph.getSelectedCells();
      if (cells.length > 0) {
        const isAlreadyBold =
          safeGet(cells, '0.attrs.label.fontWeight', 'normal') === 'bold';
        cells.forEach((cell) => {
          cell.setAttrs({
            label: { fontWeight: isAlreadyBold ? 'normal' : 'bold' },
          });
        });
        flowGraph.trigger('toolBar:forceUpdate');
      }
      return false;
    },
  },
  italic: {
    keys: 'meta + i',
    handler(flowGraph: Graph) {
      const cells = flowGraph.getSelectedCells();
      if (cells.length > 0) {
        const isAlreadyItalic =
          safeGet(cells, '0.attrs.label.fontStyle', 'normal') === 'italic';
        cells.forEach((cell) => {
          cell.setAttrs({
            label: { fontStyle: isAlreadyItalic ? 'normal' : 'italic' },
          });
        });
        flowGraph.trigger('toolBar:forceUpdate');
      }
      return false;
    },
  },
  underline: {
    keys: 'meta + u',
    handler(flowGraph: Graph) {
      const cells = flowGraph.getSelectedCells();
      if (cells.length > 0) {
        const isAlreadyUnderline =
          safeGet(cells, '0.attrs.label.textDecoration', 'none') ===
          'underline';
        cells.forEach((cell) => {
          cell.setAttrs({
            label: {
              textDecoration: isAlreadyUnderline ? 'none' : 'underline',
            },
          });
        });
        flowGraph.trigger('toolBar:forceUpdate');
      }
      return false;
    },
  },
  bringToTop: {
    keys: 'meta + ]',
    handler(flowGraph: Graph) {
      getSelectedNodes(flowGraph).forEach((node) => node.toFront());
    },
  },
  bringToBack: {
    keys: 'meta + [',
    handler(flowGraph: Graph) {
      getSelectedNodes(flowGraph).forEach((node) => node.toBack());
    },
  },
};

const registerShortcuts = (flowGraph: Graph): void => {
  Object.values(shortcuts).forEach((shortcut) => {
    const { keys, handler } = shortcut;
    flowGraph.bindKey(keys, () => handler(flowGraph));
  });
};

export default registerShortcuts;