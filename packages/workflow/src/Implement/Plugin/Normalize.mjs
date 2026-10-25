import { isPlainObject } from 'is-plain-object';
import { ThrowTypeError } from '@produck/argot';

export default function normalizePlugin(_options) {
  if (!isPlainObject(_options)) {
    ThrowTypeError('args[0]', 'plain object');
  }

  const { tag: _tag, install: _install } = _options;

  const options = {};

  if (typeof _tag === 'string' && _tag.length > 0) {
    options.tag = _tag;
  } else {
    ThrowTypeError('args[0].tag', 'non-empty string');
  }

  if (typeof _install === 'function') {
    options.install = _install;
  } else {
    ThrowTypeError('args[0].install', 'function');
  }

  return options;
}
