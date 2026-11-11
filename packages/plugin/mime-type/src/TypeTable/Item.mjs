import { Is, ThrowTypeError } from '@produck/argot';

const ALIAS = /^\S+$/;
const MIME_TYPE = /^[^\s/;]+\/[^\s/;]+$/;

export function isAlias(value) {
  return Is.Type.String(value) && ALIAS.test(value);
}

export function isAliasList(value) {
  return Is.Instance.Array(value) && value.every(isAlias);
}

export function isMimeType(value) {
  return Is.Type.String(value) && MIME_TYPE.test(value);
}

export function isCharset(value) {
  return Is.PositiveInteger(value);
}

export function copy(value) {
  return {
    mimeType: value.mimeType,
    aliasList: [...value.aliasList],
    charsetList: [...value.charsetList],
  };
}

export function normalizeItem(_item) {
  if (!Is.PlainObject(_item)) {
    ThrowTypeError('args[0]', 'plain object');
  }

  const item = {};

  const _mimeType = _item.mimeType;
  const _aliasList = _item.aliasList;
  const _charsetList = _item.charsetList;

  if (isMimeType(_mimeType)) {
    item.mimeType = _mimeType.toLowerCase();
  } else {
    ThrowTypeError('args[0].mimeType', 'type/subtype without parameters');
  }

  if (isAliasList(_aliasList)) {
    const aliasSet = new Set();

    for (const alias of _aliasList) {
      aliasSet.add(alias.toLowerCase());
    }

    item.aliasList = Object.freeze([...aliasSet]);
  } else {
    ThrowTypeError('args[0].aliasList', 'an array of alias strings');
  }

  if (!Is.Instance.Array(_charsetList)) {
    ThrowTypeError('args[0].charsetList', 'an array of MIBenum values');
  }

  for (const charset of _charsetList) {
    if (!isCharset(charset)) {
      ThrowTypeError('args[0].charsetList', 'an array of MIBenum values');
    }
  }

  item.charsetList = Object.freeze([...new Set(_charsetList)]);

  return item;
}

export { normalizeItem as normalize };
