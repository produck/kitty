import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_WORKFLOW = Symbol('.#workflow');
const I_ITEM_LIST = Symbol('.#itemList');
const I_ALIAS_INDEX = Symbol('.#aliasIndex');
const I_MIME_TYPE_INDEX = Symbol('.#mimeTypeIndex');

export const I = deepFreeze({
  WORKFLOW: I_WORKFLOW,
  ITEM_LIST: I_ITEM_LIST,
  ALIAS_INDEX: I_ALIAS_INDEX,
  MIME_TYPE_INDEX: I_MIME_TYPE_INDEX,
});

const $I_REGISTER_ITEM = Symbol('.$registerItem()');
const $I_REGISTER_ITEMS = Symbol('.$registerItems()');
const $I_DELETE_ITEM = Symbol('.$deleteItem()');

export const $I = deepFreeze({
  REGISTER_ITEM: $I_REGISTER_ITEM,
  REGISTER_ITEMS: $I_REGISTER_ITEMS,
  DELETE_ITEM: $I_DELETE_ITEM,
});
