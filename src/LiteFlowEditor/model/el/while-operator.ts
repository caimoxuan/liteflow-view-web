import { Cell, Node, Edge } from '@antv/x6';
import ELNode, { Properties } from '../node';
import { ELEndNode } from '../utils';
import {
  ConditionTypeEnum,
  LITEFLOW_EDGE,
  NODE_TYPE_INTERMEDIATE_END,
  NodeTypeEnum,
} from '../../constant';
import NodeOperator from './node-operator';

/**
 * 循环编排操作符：WHILE。
 *
 * 例如一个WHILE循环编排示例：
 * (1) EL表达式语法：WHILE(x).DO(THEN(a, b))
 * (2) JSON表示形式：
 * {
    type: ConditionTypeEnum.WHILE,
    condition: { type: NodeTypeEnum.WHILE, id: 'x' },
    children: [
      {
        type: ConditionTypeEnum.THEN,
        children: [
          { type: NodeTypeEnum.COMMON, id: 'a' },
          { type: NodeTypeEnum.COMMON, id: 'b' },
        ],
      },
    ],
  }
  * (3) 通过ELNode节点模型进行表示的组合关系为：
                                          ┌─────────────────┐
                                      ┌──▶│  NodeOperator   │
  ┌─────────┐    ┌─────────────────┐  │   └─────────────────┘      ┌─────────────────┐
  │  Chain  │───▶│  WhileOperator  │──┤   ┌─────────────────┐  ┌──▶│  NodeOperator   │
  └─────────┘    └─────────────────┘  └──▶│  ThenOperator   │──┤   └─────────────────┘
                                          └─────────────────┘  │   ┌─────────────────┐
                                                               └──▶│  NodeOperator   │
                                                                   └─────────────────┘
 */
export default class WhileOperator extends ELNode {
  type = ConditionTypeEnum.WHILE;
  parent?: ELNode;
  condition: ELNode = new NodeOperator(this, NodeTypeEnum.WHILE, 'x');
  children: ELNode[] = [];
  properties?: Properties;
  startNode?: Node;
  endNode?: Node;

  constructor(
    parent?: ELNode,
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
   * @param parent 新节点的父节点
   * @param type 新节点的子节点类型
   */
  public static create(parent?: ELNode, type?: NodeTypeEnum): ELNode {
    const newNode = new WhileOperator(parent);
    newNode.appendChild(NodeOperator.create(newNode, type));
    return newNode;
  }

  /**
   * 转换为X6的图数据格式
   */
  public toCells(
    cells: Cell[] = [],
    options: Record<string, any> = {},
  ): Cell[] {
    this.resetCells(cells);
    const { condition, children } = this;
    condition.toCells([], {
      shape: NodeTypeEnum.WHILE,
    });
    let start = condition.getStartNode();
    start.setData({ model: condition }, { overwrite: true });
    this.startNode = start;
    condition.getNodes().forEach(node => this.addNode(node))
    condition.getCells().forEach(cell => cells.push(cell))
    start = condition.getEndNode();

    const end = Node.create({
      shape: NODE_TYPE_INTERMEDIATE_END,
      attrs: {
        label: { text: '' },
      },
    });
    end.setData({ model: new ELEndNode(this) }, { overwrite: true });
    cells.push(this.addNode(end));
    this.endNode = end;

    if (children.length) {
      children.forEach((child) => {
        child.toCells([], options);
        const nextStartNode = child.getStartNode();
        cells.push(
          Edge.create({
            shape: LITEFLOW_EDGE,
            source: start.id,
            target: nextStartNode.id,
          }),
        );
        const nextEndNode = child.getEndNode();
        cells.push(
          Edge.create({
            shape: LITEFLOW_EDGE,
            source: nextEndNode.id,
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
    return this.getCells();
  }

  /**
   * 获取当前节点的开始节点
   */
  public getStartNode(): Node {
    return this.startNode as Node;
  }

  /**
   * 获取当前节点的结束节点
   */
  public getEndNode(): Node {
    return this.endNode as Node;
  }

  /**
   * 转换为EL表达式字符串
   */
  public toEL(prefix: string = ''): string {
    if (prefix) {
      return `${prefix}WHILE(${this.condition.toEL()}).DO(\n${this.children
        .map((x) => x.toEL(`${prefix}  `))
        .join(', \n')}\n${prefix})${this.propertiesToEL()}`;
    }

    return `WHILE(${this.condition.toEL()}).DO(${this.children
      .map((x) => x.toEL())
      .join(', ')})`;
  }
}
