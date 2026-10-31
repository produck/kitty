import { Is, ThrowTypeError } from '@produck/argot';

export default function normalizePlugin(_options) {
  if (!Is.PlainObject(_options)) {
    ThrowTypeError('args[0]', 'plain object');
  }

  const { tag: _tag, install: _install } = _options;

  const options = {};

  if (Is.Type.String(_tag) && _tag.length > 0) {
    options.tag = _tag;
  } else {
    ThrowTypeError('args[0].tag', 'non-empty string');
  }

  if (Is.Type.Function(_install)) {
    options.install = _install;
  } else {
    ThrowTypeError('args[0].install', 'function');
  }

  return options;
}
