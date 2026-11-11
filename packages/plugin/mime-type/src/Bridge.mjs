import { ThrowTypeError } from '@produck/argot';

import * as TypeTable from './TypeTable/index.mjs';

const TABLE_MAP = new WeakMap();

export function installTypeTable(workflow) {
  const typeTable = new TypeTable.Concrete(workflow);

  TABLE_MAP.set(workflow, typeTable);

  return typeTable;
}

export function getTypeTable(workflow) {
  if (!TABLE_MAP.has(workflow)) {
    ThrowTypeError('args[0] as workflow', 'installed workflow');
  }

  return TABLE_MAP.get(workflow);
}
