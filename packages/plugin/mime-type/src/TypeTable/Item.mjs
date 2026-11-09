import { Is, ThrowTypeError } from '@produck/argot';

const ALIAS = /^\S+$/;
const MIME_TYPE = /^[^\s/;]+\/[^\s/;]+$/;

export function isAlias(value) {
  return Is.Type.String(value) && ALIAS.test(value);
}

export function isMimeType(value) {
  return Is.Type.String(value) && MIME_TYPE.test(value);
}

export function isCharset(value) {
  return Is.PositiveInteger(value);
}

export function copy(value) {
  return {
    alias: value.alias,
    mimeType: value.mimeType,
    charsetList: [...value.charsetList],
  };
}

export function normalizeItem(_item) {
  if (!Is.PlainObject(_item)) {
    ThrowTypeError('args[0]', 'plain object');
  }

  const item = {};
  const {
    alias: _alias,
    mimeType: _mimeType,
    charsetList: _charsetList,
  } = _item;

  if (isAlias(_alias)) {
    item.alias = _alias.toLowerCase();
  } else {
    ThrowTypeError('args[0].alias', 'non-empty string without whitespace');
  }

  if (isMimeType(_mimeType)) {
    item.mimeType = _mimeType.toLowerCase();
  } else {
    ThrowTypeError('args[0].mimeType', 'type/subtype without parameters');
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
