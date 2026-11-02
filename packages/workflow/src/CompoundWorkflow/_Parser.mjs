import { instanceOf, Is, Ow, ThrowTypeError } from '@produck/argot';
import { isKit, isDependenceName } from '@produck/kit';
import { isSubConstructor } from '@produck/is-sub-constructor';

import Deployer from './Deployer/_Abstract.mjs';

export * from '../_Parser.mjs';

export function SubDeployer(value) {
  if (!isSubConstructor(value, Deployer)) {
    ThrowTypeError('args[0] as deployer', 'sub class of Deployer');
  }

  return value;
}

export function Kit(value) {
  if (!isKit(value)) {
    ThrowTypeError('args[0] as kit', 'Kit');
  }

  return value;
}

export function DependenceName(value) {
  if (!isDependenceName(value)) {
    ThrowTypeError('args[0] as dependency name', 'string | symbol');
  }

  return value;
}

export function Attacher(value) {
  if (!Is.Type.Function(value)) {
    ThrowTypeError('args[0] as attacher', 'function');
  }

  return value;
}

export function ReadableStreamResult(value) {
  if (!Is.Type.Object(value)) {
    ThrowTypeError('member', 'a { stream, length } record');
  }

  const { stream, length } = value;

  if (stream === null) {
    if (length !== 0) {
      Ow.Error.Common('It MUST be 0 when the stream is null.');
    }

    return value;
  }

  if (!instanceOf(stream, ReadableStream)) {
    ThrowTypeError('member', 'a ReadableStream or null stream');
  }

  if (stream.locked) {
    Ow.Error.Common('It MUST NOT be locked.');
  }

  if (length !== null && !Is.NonNegativeInteger(length)) {
    ThrowTypeError('member', 'null or a non-negative integer length');
  }

  return value;
}
