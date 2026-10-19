import { Ow, ThrowTypeError } from '@produck/argot';

export function ReadableStreamResult(value) {
  if (value === null || typeof value !== 'object') {
    ThrowTypeError('member', 'a { stream, length } record');
  }

  const { stream, length } = value;

  if (stream === null) {
    if (length !== 0) {
      Ow.Error.Common('It MUST be 0 when the stream is null.');
    }

    return value;
  }

  if (!(stream instanceof ReadableStream)) {
    ThrowTypeError('member', 'a ReadableStream or null stream');
  }

  if (stream.locked) {
    Ow.Error.Common('It MUST NOT be locked.');
  }

  if (length !== null && (!Number.isInteger(length) || length < 0)) {
    ThrowTypeError('member', 'null or a non-negative integer length');
  }

  return value;
}
