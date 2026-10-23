import { isPlainObject } from 'is-plain-object';
import { ThrowTypeError } from '@produck/argot';

export default function normalizeCompoundWorkflow(_options) {
  if (!isPlainObject(_options)) {
    ThrowTypeError('args[0]', 'plain object');
  }

  const { normalizeHttpResponseBodyData: _normalize } = _options;

  const options = {};

  if (typeof _normalize === 'function') {
    options.normalizeHttpResponseBodyData = _normalize;
  } else {
    ThrowTypeError('args[0].normalizeHttpResponseBodyData', 'function');
  }

  return options;
}
