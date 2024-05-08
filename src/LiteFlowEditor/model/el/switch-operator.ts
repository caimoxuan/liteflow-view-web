import { Cell, Node, Edge } from '@antv/x6';
import ELNode, { Properties, ELEndNode } from '../node';
import {
  ConditionTypeEnum,
  LITEFLOW_EDGE,
  NODE_TYPE_INTERMEDIATE_END,
  NodeTypeEnum,
} from '../../constant';
import NodeOperator from './node-operator';

export default class SwitchOperator extends ELNode {
  type = ConditionTypeEnum.SWITCH;
  parent: ELNode;
  condition: ELNode = new NodeOperator(this, NodeTypeEnum.SWITCH, 'x');
  children: ELNode[] = [];
  properties?: Properties;

  constructor(
    parent: ELNode,
    condition?: ELNode,
    children?: ELNode[],
    properties?: Properties,
  ) {
    super();
    this.parent = parent;
    if (condition) {
      this.condition = condition;
    }
    if (children) {
      this.children = children;
    }
    this.properties = properties;
  }

  /**
   * 创建新的节点
   * @param parent 父节点
   */
  public static create(parent: ELNode): ELNode {
    const newNode = new SwitchOperator(parent);
    newNode.children = [NodeOperator.create(newNode)];
    return newNode;
  }

  /**
   * 转换为X6的图数据格式
   */
  public toCells(
    previous: Node,
    cells: Cell[],
    options?: Record<string, any>,
  ): Node {
    const { condition, children } = this;
    const start = Node.create({
      shape: condition.type,
      attrs: {
        label: { text: condition.id },
      },
    });
    start.setData({ model: condition }, { overwrite: true });
    cells.push(start);
    cells.push(
      Edge.create({
        shape: LITEFLOW_EDGE,
        source: previous.id,
        target: start.id,
      }),
    );
    const end = Node.create({
      shape: NODE_TYPE_INTERMEDIATE_END,
      attrs: {
        label: { text: '' },
      },
    });
    end.setData({ model: new ELEndNode(this) }, { overwrite: true });
    cells.push(end);
    if (children.length) {
      children.forEach((child) => {
        const next = child.toCells(start, cells, options) as Node;
        cells.push(
          Edge.create({
            shape: LITEFLOW_EDGE,
            source: next.id,
            target: end.id,
          }),
        );
      });
    } else {
      cells.push(
        Edge.create({
          shape: LITEFLOW_EDGE,
          source: start.id,
          target: end.id,
        }),
      );
    }

    return end;
  }
  /**
   * 转换为EL表达式字符串
   */
  public toEL(): string {
    return `SWITCH(${this.condition.toEL()}).to(${this.children
      .map((x) => x.toEL())
      .join(', ')})`;
  }
}