import { Ow } from '@produck/argot';

import * as Item from './Item.mjs';
import * as P from './_Parser.mjs';
import { I, $I } from './_Symbol.mjs';

export default class TypeTable {
  [I.ITEM_LIST] = [];
  [I.ALIAS_INDEX] = new Map();
  [I.MIME_TYPE_INDEX] = new Map();

  constructor(workflow) {
    this[I.WORKFLOW] = workflow;
  }

  [$I.REGISTER_ITEM](item) {
    const aliasIndex = this[I.ALIAS_INDEX];
    const sameAlias = aliasIndex.get(item.alias) ?? [];

    if (sameAlias.some(({ mimeType }) => mimeType === item.mimeType)) {
      Ow.Error.Common(`The mime type item "${item.alias}" is registered.`);
    }

    this[I.ITEM_LIST].push(item);
    attach(aliasIndex, item.alias, item);
    attach(this[I.MIME_TYPE_INDEX], item.mimeType, item);

    return Item.copy(item);
  }

  [$I.REGISTER_ITEMS](itemList) {
    for (const item of itemList) {
      this[$I.REGISTER_ITEM](item);
    }
  }

  [$I.DELETE_ITEM](item) {
    const itemList = this[I.ITEM_LIST];
    const at = itemList.findIndex(
      ({ alias, mimeType }) =>
        alias === item.alias && mimeType === item.mimeType,
    );

    if (at === -1) {
      Ow.Error.Common(`The mime type item "${item.alias}" is absent.`);
    }

    const [target] = itemList.splice(at, 1);

    detach(this[I.ALIAS_INDEX], target.alias, target);
    detach(this[I.MIME_TYPE_INDEX], target.mimeType, target);
  }

  findByAlias(alias) {
    const list = this[I.ALIAS_INDEX].get(P.Alias(alias));

    return list === undefined ? [] : list.map(Item.copy);
  }

  findByMimeType(mimeType) {
    const list = this[I.MIME_TYPE_INDEX].get(P.MimeType(mimeType));

    return list === undefined ? [] : list.map(Item.copy);
  }

  findAll() {
    return this[I.ITEM_LIST].map(Item.copy);
  }
}

function attach(index, key, item) {
  const list = index.get(key);

  if (list === undefined) {
    index.set(key, [item]);

    return;
  }

  list.push(item);
}

function detach(index, key, item) {
  const list = index.get(key);
  const at = list.indexOf(item);

  list.splice(at, 1);

  if (list.length === 0) {
    index.delete(key);
  }
}
