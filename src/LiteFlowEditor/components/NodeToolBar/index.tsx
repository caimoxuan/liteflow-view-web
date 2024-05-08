import classNames from 'classnames';
import { debounce } from 'lodash';
import { Modal, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import styles from './index.module.less';

const NodeToolBar: React.FC<any> = (props) => {
  const { node } = props;
  const {
    model,
    toolbar = { append: true, delete: true, prepend: true, replace: true },
  } = node.getData() || {};
  const onPrepend = debounce(({ clientX, clientY }: any) => {
    node.model?.graph.trigger('graph:showContextPad', {
      x: clientX,
      y: clientY,
      node,
      scene: 'prepend',
      title: '前插节点',
      edge: null,
    });
  }, 100);
  const onAppend = debounce(({ clientX, clientY }: any) => {
    node.model?.graph.trigger('graph:showContextPad', {
      x: clientX,
      y: clientY,
      node,
      scene: 'append',
      title: '后插节点',
      edge: null,
    });
  }, 100);
  const onReplace = debounce(({ clientX, clientY }: any) => {
    node.model?.graph.trigger('graph:showContextPad', {
      x: clientX,
      y: clientY,
      node,
      scene: 'replace',
      title: '替换节点',
      edge: null,
    });
  }, 100);
  const onDelete = debounce(() => {
    Modal.confirm({
      title: `确认要删除节点${(model.id && `“${model.id}”`) || ''}？`,
      content: '点击确认按钮进行删除，点击取消按钮返回',
      onOk() {
        if (model.remove()) {
          node.model?.graph.trigger('model:change');
        }
      },
    });
  }, 100);
  return (
    <div className={classNames(styles.liteflowNodeToolBar)}>
      {toolbar.prepend && (
        <div
          className={classNames(styles.liteflowAddNodePrepend)}
          onClick={onPrepend}
        >
          <div className={classNames(styles.liteflowAddNodePrependIcon)}></div>
        </div>
      )}
      {toolbar.append && (
        <div
          className={classNames(styles.liteflowAddNodeAppend)}
          onClick={onAppend}
        >
          <div className={classNames(styles.liteflowAddNodeAppendIcon)}></div>
        </div>
      )}
      {(toolbar.replace || toolbar.delete) && (
        <div className={classNames(styles.liteflowTopToolBar)}>
          {
            <div
              className={classNames(styles.liteflowToolBarBtn)}
              onClick={onReplace}
            >
              <Tooltip title="替换节点">
                <EditOutlined />
              </Tooltip>
            </div>
          }
          {
            <div
              className={classNames(
                styles.liteflowToolBarBtn,
                styles.liteflowDeleteNode,
              )}
              onClick={onDelete}
            >
              <Tooltip title="删除节点">
                <DeleteOutlined />
              </Tooltip>
            </div>
          }
        </div>
      )}
    </div>
  );
};

export default NodeToolBar;
