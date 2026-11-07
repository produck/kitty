import { ThrowTypeError } from '@produck/argot';

import * as Item from './Item.mjs';

export function Alias(_alias) {
  if (Item.isAlias(_alias)) {
    return _alias.toLowerCase();
  }

  ThrowTypeError('args[0]', 'non-empty string without whitespace');
}

export function MimeType(_mimeType) {
  if (Item.isMimeType(_mimeType)) {
    return _mimeType.toLowerCase();
  }

  ThrowTypeError('args[0]', 'type/subtype without parameters');
}
