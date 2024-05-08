import { Cell, Node } from '@antv/x6';
import { ConditionTypeEnum, NodeTypeEnum } from '../constant';

/**
 * EL表达式的模型表示：数据结构本质上是一个树形结构。
 * 例如一个串行编排(THEN)：
 * (1) EL表达式形式：THEN(a, b, c, d)
 * (2) JSON表示形式：
 * {
    type: ConditionTypeEnum.THEN,
    children: [
      { type: NodeTypeEnum.COMMON, id: 'a' },
      { type: NodeTypeEnum.COMMON, id: 'b' },
      { type: NodeTypeEnum.COMMON, id: 'c' },
      { type: NodeTypeEnum.COMMON, id: 'd' },
    ],
  }
 * (3) 通过ELNode节点模型表示为：
                                          ┌─────────────────┐
                                      ┌──▶│  NodeOperator   │
                                      │   └─────────────────┘
                                      │   ┌─────────────────┐
                                      ├──▶│  NodeOperator   │
  ┌─────────┐    ┌─────────────────┐  │   └─────────────────┘
  │  Chain  │───▶│  ThenOperator   │──┤   ┌─────────────────┐
  └─────────┘    └─────────────────┘  ├──▶│  NodeOperator   │
                                      │   └─────────────────┘
                                      │   ┌─────────────────┐
                                      └──▶│  NodeOperator   │
                                          └─────────────────┘
 */
export default abstract class ELNode {
  // 节点类型：可以是编排类型，也可以是组件类型
  public abstract type: ConditionTypeEnum | NodeTypeEnum;
  // 当前节点的子节点：编排类型有子节点，组件类型没有子节点
  public children?: ELNode[];
  // 当前节点的父节点
  public parent?: ELNode;
  // 判断类节点类型：主要用于SWITCH/IF/FOR/WHILE等编排类型
  public condition?: ELNode;
  // 组件节点的id
  public id?: string;
  // 编排节点的属性：可以设置id/tag等等
  public properties?: Properties;

  /**
   * 在后面添加子节点
   * @param newNode 子节点
   * @param index 指定位置：可以是索引，也可以是兄弟节点
   */
  public appendChildAt(newNode: ELNode): boolean;
  public appendChildAt(newNode: ELNode, index: number): boolean;
  public appendChildAt(newNode: ELNode, sibling: ELNode): boolean;
  public appendChildAt(newNode: ELNode, index?: number | ELNode): boolean {
    newNode.parent = this;
    if (this.children) {
      // 尝试在父节点中添加新节点
      if (typeof index === 'number') {
        // 1. 如果有索引
        this.children.splice(index, 0, newNode);
        return true;
      } else if (index) {
        // 2. 如果有目标节点
        const _index = this.children.indexOf(index);
        if (_index !== -1) {
          this.children.splice(_index + 1, 0, newNode);
          return true;
        } else if (this.condition === index) {
          // 3. 如果是在condition之后追加
          return this.appendChildAt(newNode, 0);
        } else {
          this.children.push(newNode);
          return true;
        }
      } else {
        // 4. 否则直接插入
        this.children.push(newNode);
        return true;
      }
    }
    return false;
  }

  /**
   * 在后面添加子节点
   * @param newNode 子节点
   * @param index 指定位置：可以是索引，也可以是兄弟节点
   */
  public prependChildAt(newNode: ELNode): boolean;
  public prependChildAt(newNode: ELNode, index: number): boolean;
  public prependChildAt(newNode: ELNode, sibling: ELNode): boolean;
  public prependChildAt(newNode: ELNode, index?: number | ELNode): boolean {
    newNode.parent = this;
    if (this.children) {
      // 尝试在父节点中添加新节点
      if (typeof index === 'number') {
        // 1. 如果有索引
        this.children.splice(index, 0, newNode);
        return true;
      } else if (index) {
        // 2. 如果有目标节点
        const _index = this.children.indexOf(index);
        if (_index !== -1) {
          this.children.splice(_index, 0, newNode);
          return true;
        } else if (this.condition === index) {
          // 3. 如果是在condition之前追加
          return this.prepend(newNode);
        } else {
          this.children.splice(0, 0, newNode);
          return true;
        }
      } else {
        // 4. 否则直接插入
        this.children.splice(0, 0, newNode);
        return true;
      }
    }
    return false;
  }

  /**
   * 删除指定的子节点
   * @param child 子节点
   */
  public removeChild(child: ELNode): boolean {
    if (this.children) {
      const index = this.children.indexOf(child);
      if (index !== -1) {
        this.children.splice(index, 1);
        return true;
      }
    }
    if (this.condition && this.condition === child) {
      return this.remove();
    }
    return false;
  }

  /**
   * 在当前节点的前面、插入新节点
   * @param newNode 新节点
   * @returns
   */
  public prepend(newNode: ELNode): boolean {
    if (this.parent) {
      if (this.parent.prependChildAt(newNode, this)) {
        return true;
      }
    } else {
      return this.prependChildAt(newNode);
    }
    return false;
  }

  /**
   * 在当前节点的后面、插入新节点
   * @param newNode 新节点
   * @returns
   */
  public append(newNode: ELNode): boolean {
    if (this.parent) {
      if (this.parent.appendChildAt(newNode, this)) {
        return true;
      }
    } else {
      return this.appendChildAt(newNode);
    }
    return false;
  }

  /**
   * 删除当前节点
   */
  public remove(): boolean {
    if (this.parent) {
      return this.parent.removeChild(this);
    }
    return false;
  }

  /**
   * 替换当前节点为新节点
   * @param newNode 新节点
   * @returns
   */
  public replace(newNode: ELNode): boolean {
    if (this.parent) {
      this.parent.replaceChild(this, newNode);
    }
    return false;
  }

  /**
   * 替换老节点为新节点
   * @param oldNode 老节点
   * @param newNode 新节点
   */
  public replaceChild(oldNode: ELNode, newNode: ELNode): boolean {
    newNode.parent = this;
    if (this.children) {
      // 尝试在子节点中查找老节点位置
      const index = this.children.indexOf(oldNode);
      if (index !== -1) {
        this.children.splice(index, 1, newNode);
        return true;
      }
    }
    if (this.condition === oldNode) {
      // 3. 如果是在condition之后追加
      this.condition = newNode;
      return true;
    }
    return false;
  }

  /**
   * 转换为X6的图数据格式
   */
  public abstract toCells(
    previous?: Node,
    cells?: Cell[],
    options?: Record<string, any>,
  ): Cell[] | Node;

  /**
   * 转换为EL表达式字符串
   */
  public abstract toEL(): string;
}

/**
 * EL表达式操作符可以设置的id和tag等等属性。
 */
export interface Properties {
  id?: string;
  tag?: string;
  [key: string]: any;
}

/**
 * 操作符中开始节点的模型（作为操作符模型的代理），
 * 操作符包括WHEN。
 */
export class ELStartNode extends ELNode {
  public type = NodeTypeEnum.VIRTUAL;
  /** 代理的节点组件 */
  public proxy: ELNode;
  /** 代理节点组件的相关属性 */
  public parent?: ELNode;

  constructor(proxy: ELNode) {
    super();
    this.proxy = proxy;
    this.parent = proxy.parent;
  }

  /**
   * 在开始节点的前面、插入新节点
   * @param newNode 新节点
   * @returns
   */
  public prepend(newNode: ELNode): boolean {
    return this.proxy.prepend(newNode);
  }

  /**
   * 在开始节点的后面、插入新节点
   * @param newNode 新节点
   * @returns
   */
  public append(newNode: ELNode): boolean {
    return this.proxy.prependChildAt(newNode);
  }

  /**
   * 删除开始节点
   */
  public remove(): boolean {
    return this.proxy.remove();
  }

  /**
   * 替换当前节点为新节点
   * @param newNode 新节点
   * @returns
   */
  public replace(newNode: ELNode): boolean {
    return this.proxy.replace(newNode);
  }

  /**
   * 转换为X6的图数据格式
   */
  public toCells(): Cell[] | Node {
    throw new Error('Method not implemented.');
  }

  /**
   * 转换为EL表达式字符串
   */
  public toEL(): string {
    throw new Error('Method not implemented.');
  }
}

/**
 * 操作符中结束节点的模型（作为操作符模型的代理），
 * 操作符包括WHEN、SWITCH、IF、FOR、WHILE等等
 */
export class ELEndNode extends ELNode {
  public type = NodeTypeEnum.VIRTUAL;
  public proxy: ELNode;
  public parent?: ELNode;

  constructor(proxy: ELNode) {
    super();
    this.proxy = proxy;
    this.parent = proxy.parent;
  }

  /**
   * 在结束节点的前面、插入新节点
   * @param newNode 新节点
   * @returns
   */
  public prepend(newNode: ELNode): boolean {
    return this.proxy.appendChildAt(newNode);
  }

  /**
   * 在结束节点的后面、插入新节点
   * @param newNode 新节点
   * @returns
   */
  public append(newNode: ELNode): boolean {
    return this.proxy.append(newNode);
  }

  /**
   * 删除结束节点
   */
  public remove(): boolean {
    return this.proxy.remove();
  }

  /**
   * 替换当前节点为新节点
   * @param newNode 新节点
   * @returns
   */
  public replace(newNode: ELNode): boolean {
    return this.proxy.replace(newNode);
  }

  /**
   * 转换为X6的图数据格式
   */
  public toCells(): Node<Node.Properties> {
    throw new Error('Method not implemented.');
  }

  /**
   * 转换为EL表达式字符串
   */
  public toEL(): string {
    throw new Error('Method not implemented.');
  }
}
