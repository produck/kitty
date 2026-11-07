import { ThrowTypeError } from '@produck/argot';
import { Abstract } from '@produck/kitty-workflow';

import * as Bridge from './Bridge.mjs';
import * as TypeTable from './TypeTable/index.mjs';
import { $I } from './TypeTable/_Symbol.mjs';

export { useTypeTable } from './Capability.mjs';
export { Plugin } from './Plugin.mjs';
export { Standard, Web, Media, Document } from './Preset/index.mjs';

function assertWorkflow(value) {
  if (!(value instanceof Abstract.Workflow)) {
    ThrowTypeError('args[0] as workflow', 'Workflow');
  }
}

function Operation(perform) {
  return (workflow, ...argList) => {
    assertWorkflow(workflow);

    return perform(Bridge.getTypeTable(workflow), ...argList);
  };
}

export const registerItem = Operation((typeTable, item) => {
  return typeTable[$I.REGISTER_ITEM](TypeTable.Item.normalize(item));
});

export const registerItems = Operation((typeTable, itemList) => {
  return typeTable[$I.REGISTER_ITEMS](itemList.map(TypeTable.Item.normalize));
});

export const deleteItem = Operation((typeTable, item) => {
  return typeTable[$I.DELETE_ITEM](TypeTable.Item.normalize(item));
});

export const findAll = Operation((typeTable) => {
  return typeTable.findAll();
});
