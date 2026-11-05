import { Is, ThrowTypeError } from '@produck/argot';

export * from '../_Parser.mjs';

export function HeaderName(value) {
  if (!Is.Type.String(value) || value.length === 0) {
    ThrowTypeError('member', 'a non-empty header name string');
  }

  return value;
}
