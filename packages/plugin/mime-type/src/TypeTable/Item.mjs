import { Is, ThrowTypeError } from '@produck/argot';

const ALIAS = /^\S+$/;
const MIME_TYPE = /^[^\s/;]+\/[^\s/;]+$/;

export function isAlias(value) {
  return Is.Type.String(value) && ALIAS.test(value);
}

export function isMimeType(value) {
  return Is.Type.String(value) && MIME_TYPE.test(value);
}

export function copy(value) {
  return { alias: value.alias, mimeType: value.mimeType };
}

export function normalizeItem(_item) {
  if (!Is.PlainObject(_item)) {
    ThrowTypeError('args[0]', 'plain object');
  }

  const item = {};
  const { alias: _alias, mimeType: _mimeType } = _item;

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

  return item;
}

export { normalizeItem as normalize };
