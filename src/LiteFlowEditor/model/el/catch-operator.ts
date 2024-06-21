import { Cell, Node, Edge } from '@antv/x6';
import ELNode, { Properties } from '../node';
import { ELStartNode, ELEndNode } from '../utils';
import {
  ConditionTypeEnum,
  LITEFLOW_EDGE,
  NODE_TYPE_INTERMEDIATE_END,
  NodeTypeEnum,
} from '../../constant';
import NodeOperator from './node-operator';
// import ErrorIcon from '../../assets/intermediate-event-catch-error.svg'

/**
 * 捕获异常操作符：CATCH。
 *
 * 例如一个捕获异常(CATCH)示例：
 * (1) EL表达式语法：CATCH(THEN(a, b)).DO(c)
 * (2) JSON表示形式：
 * {
    type: ConditionTypeEnum.CATCH,
    children: [
      { 
        type: NodeTypeEnum.THEN,
        children: [
          { type: NodeTypeEnum.COMMON, id: 'a' },
          { type: NodeTypeEnum.COMMON, id: 'b' }
        ]
      },
      { type: NodeTypeEnum.COMMON, id: 'c' }
    ],
  }
  * (3) 通过ELNode节点模型进行表示的组合关系为：
                                          ┌─────────────────┐      ┌─────────────────┐
                                      ┌──▶│  ThenOperator   │──┌──▶│  NodeOperator   │
  ┌─────────┐    ┌─────────────────┐  │   └─────────────────┘  │   └─────────────────┘
  │  Chain  │───▶│  CatchOperator  │──┤   ┌─────────────────┐  │   ┌─────────────────┐
  └─────────┘    └─────────────────┘  └──▶│  NodeOperator   │  └──▶│  NodeOperator   │
                                          └─────────────────┘      └─────────────────┘
                                                             
                                                             
 */
export default class CatchOperator extends ELNode {
  type = ConditionTypeEnum.CATCH;
  parent?: ELNode;
  children: ELNode[] = [];
  properties?: Properties;
  startNode?: Node;
  endNode?: Node;

  constructor(parent?: ELNode, children?: ELNode[], properties?: Properties) {
    super();
    this.parent = parent;
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
    const newNode = new CatchOperator(parent);
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
    const { children } = this;
    const start = Node.create({
      shape: ConditionTypeEnum.CATCH,
      attrs: {
        label: { text: '' },
      },
    });
    start.setData({ model: new ELStartNode(this) }, { overwrite: true });
    cells.push(this.addNode(start));
    this.startNode = start;

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
      children.forEach((child: ELNode) => {
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
    const [catchNode, doNode] = this.children;
    if (prefix) {
      return `${prefix}CATCH(\n${catchNode.toEL(`${prefix}  `)}\n${prefix})${doNode ? `.DO(\n${doNode.toEL(`${prefix}  `)}\n${prefix})` : ''}${this.propertiesToEL()}`;
    }
    return `CATCH(${catchNode.toEL()})${doNode ? `.DO(${doNode.toEL()})` : ''}${this.propertiesToEL()}`;
  }

  /**
   * 转换为JSON格式
   */
  public toJSON(): Record<string, any> {
    const { type, children, properties } = this;
    return {
      type,
      children: children.map((child) => child.toJSON()),
      properties,
    };
  }
}