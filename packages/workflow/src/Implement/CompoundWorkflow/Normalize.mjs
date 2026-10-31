import { Is, ThrowTypeError } from '@produck/argot';

export default function normalizeCompoundWorkflow(_options) {
  if (!Is.PlainObject(_options)) {
    ThrowTypeError('args[0]', 'plain object');
  }

  const { normalizeHttpResponseBodyData: _normalize } = _options;

  const options = {};

  if (Is.Type.Function(_normalize)) {
    options.normalizeHttpResponseBodyData = _normalize;
  } else {
    ThrowTypeError('args[0].normalizeHttpResponseBodyData', 'function');
  }

  return options;
}
