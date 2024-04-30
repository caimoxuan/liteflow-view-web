import { Cell, Node, Edge } from '@antv/x6';
import {
  NodeTypeEnum,
  ConditionTypeEnum,
  NODE_TYPE_START,
  NODE_TYPE_END,
  NODE_TYPE_INTERMEDIATE_END,
  NODE_TYPE_VIRTUAL,
  LITEFLOW_EDGE,
} from '../constant';
export { default as toString } from './toString';

interface ParseParameters {
  data: Record<string, any>;
  parent: Record<string, any> | undefined;
  cells: Cell[];
  previous: Node;
  options?: Record<string, any>;
}

export default function render(data: Record<string, any>) {
  const cells: Cell[] = [];
  // 1. 首先：添加一个开始节点
  const start: Node = Node.create({
    shape: NODE_TYPE_START,
    view: 'react-shape-view',
    attrs: {
      label: { text: '开始' },
    },
  });
  start.setData({ model: data, parent: undefined }, { overwrite: true });

  cells.push(start);

  // 2. 其次：解析已有的节点
  const next: Cell = parse({ data, parent: undefined, cells, previous: start });

  // 3. 最后：添加一个结束节点
  const last: Node = Node.create({
    shape: NODE_TYPE_END,
    view: 'react-shape-view',
    attrs: {
      label: { text: '结束' },
    },
  });
  last.setData({ model: data, parent: undefined }, { overwrite: true });
  cells.push(last);

  cells.push(
    Edge.create({
      shape: LITEFLOW_EDGE,
      source: next.id,
      target: last.id,
    }),
  );

  return cells;
}

export function parse({
  data,
  parent,
  cells,
  previous,
  options,
}: ParseParameters): Node {
  if (!data.type) return previous;

  switch (data.type) {
    // 1、编排类：顺序、分支、循环
    case ConditionTypeEnum.THEN:
      return parseThen({ data, parent, cells, previous, options });
    case ConditionTypeEnum.WHEN:
      return parseWhen({ data, parent, cells, previous, options });
    case ConditionTypeEnum.SWITCH:
      return parseSwitch({ data, parent, cells, previous, options });
    case ConditionTypeEnum.IF:
      return parseIf({ data, parent, cells, previous, options });
    case ConditionTypeEnum.FOR:
    case ConditionTypeEnum.WHILE:
    case ConditionTypeEnum.ITERATOR:
      return parseLoop({ data, parent, cells, previous, options });

    // 2、组件类：顺序、分支、循环
    case NodeTypeEnum.COMMON:
    default:
      return parseCommon({ data, parent, cells, previous, options });
  }
}

function parseThen({
  data,
  parent,
  cells,
  previous,
  options,
}: ParseParameters) {
  const { children } = data;
  let last: Node = previous;
  children.forEach((child: Record<string, any>) => {
    last = parse({
      data: child,
      parent: data,
      cells,
      previous: last,
      options,
    });
  });
  return last;
}

function parseWhen({
  data,
  parent,
  cells,
  previous,
  options,
}: ParseParameters) {
  const { children } = data;
  const start = Node.create({
    shape: ConditionTypeEnum.WHEN,
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
  });
  start.setData({ model: data, parent }, { overwrite: true });
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
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
  });
  end.setData({ model: data, parent }, { overwrite: true });
  children.forEach((child: Record<string, any>) => {
    const next = parse({
      data: child,
      parent: data,
      cells,
      previous: start,
      options,
    });
    cells.push(
      Edge.create({
        shape: LITEFLOW_EDGE,
        source: next.id,
        target: end.id,
      }),
    );
  });
  cells.push(end);
  return end;
}

function parseSwitch({
  data,
  parent,
  cells,
  previous,
  options,
}: ParseParameters) {
  const { condition, children } = data;
  const start = Node.create({
    shape: condition.type,
    view: 'react-shape-view',
    attrs: {
      label: { text: condition.id },
    },
  });
  start.setData({ model: data, parent }, { overwrite: true });
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
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
  });
  end.setData({ model: data, parent }, { overwrite: true });
  children.forEach((child: Record<string, any>) => {
    const next = parse({
      data: child,
      parent: data,
      cells,
      previous: start,
      options,
    });
    cells.push(
      Edge.create({
        shape: LITEFLOW_EDGE,
        source: next.id,
        target: end.id,
      }),
    );
  });
  cells.push(end);
  return end;
}

function parseIf({ data, parent, cells, previous, options }: ParseParameters) {
  const { condition, children = [] } = data;
  const start = Node.create({
    shape: condition.type,
    view: 'react-shape-view',
    attrs: {
      label: { text: condition.id },
    },
  });
  start.setData({ model: data, parent }, { overwrite: true });
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
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
  });
  end.setData({ model: data, parent }, { overwrite: true });
  const [first, last] = children;
  const trueNode = parse({
    data: first,
    parent: data,
    cells,
    previous: start,
    options: { edge: { label: 'true' } },
  });
  cells.push(
    Edge.create({
      shape: LITEFLOW_EDGE,
      source: trueNode.id,
      target: end.id,
    }),
  );
  let falseNode;
  if (!last) {
    falseNode = parse({
      data: { type: NODE_TYPE_VIRTUAL, id: 'v' },
      parent: data,
      cells,
      previous: start,
      options: {
        edge: { label: 'false' },
        node: { attrs: { label: { text: '' } } },
      },
    });
  } else {
    falseNode = parse({
      data: last,
      parent: data,
      cells,
      previous: start,
      options: { edge: { label: 'false' } },
    });
  }

  cells.push(
    Edge.create({
      shape: LITEFLOW_EDGE,
      source: falseNode.id,
      target: end.id,
    }),
  );
  cells.push(end);
  return end;
}

function parseLoop({
  data,
  parent,
  cells,
  previous,
  options,
}: ParseParameters) {
  const { condition, children } = data;
  const start = Node.create({
    shape: condition.type,
    view: 'react-shape-view',
    attrs: {
      label: { text: condition.id },
    },
  });
  start.setData({ model: data, parent }, { overwrite: true });
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
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
  });
  end.setData({ model: data, parent }, { overwrite: true });
  if (children.length === 1 && children[0].type === ConditionTypeEnum.THEN) {
    children[0].children.forEach((child: Record<string, any>) => {
      const next = parse({
        data: child,
        parent: data,
        cells,
        previous: start,
        options,
      });
      cells.push(
        Edge.create({
          shape: LITEFLOW_EDGE,
          source: next.id,
          target: end.id,
        }),
      );
    });
  } else {
    children.forEach((child: Record<string, any>) => {
      const next = parse({
        data: child,
        parent: data,
        cells,
        previous: start,
        options,
      });
      cells.push(
        Edge.create({
          shape: LITEFLOW_EDGE,
          source: next.id,
          target: end.id,
        }),
      );
    });
  }
  cells.push(end);
  return end;
}

function parseCommon({
  data,
  parent,
  cells,
  previous,
  options = {},
}: ParseParameters) {
  const { id, type } = data;
  const common = Node.create({
    shape: type,
    view: 'react-shape-view',
    attrs: {
      label: { text: id },
    },
    ...(options.node || {}),
  });
  common.setData({ model: data, parent }, { overwrite: true });
  cells.push(common);

  if (previous) {
    cells.push(
      Edge.create({
        shape: LITEFLOW_EDGE,
        source: previous.id,
        target: common.id,
        ...(options.edge || {}),
      }),
    );
  }
  return common;
}
