import { isPlainObject } from 'is-plain-object';
import { ThrowTypeError } from '@produck/argot';

export default function normalizePlugin(_options) {
  if (!isPlainObject(_options)) {
    ThrowTypeError('args[0]', 'plain object');
  }

  const { name: _name, install: _install } = _options;

  const options = {};

  if (typeof _name === 'string' && _name.length > 0) {
    options.name = _name;
  } else {
    ThrowTypeError('args[0].name', 'non-empty string');
  }

  if (typeof _install === 'function') {
    options.install = _install;
  } else {
    ThrowTypeError('args[0].install', 'function');
  }

  return options;
}
