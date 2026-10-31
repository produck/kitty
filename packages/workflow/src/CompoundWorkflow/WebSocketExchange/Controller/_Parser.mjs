import { Is, ThrowTypeError } from '@produck/argot';

export * from '../_Parser.mjs';

const READY_STATES = Object.freeze([0, 1, 2, 3]);
const READY_STATES_TAG = READY_STATES.join(' | ');

export function ReadyState(value) {
  if (!Is.NonNegativeInteger(value) || !READY_STATES.includes(value)) {
    ThrowTypeError('member', `a WebSocket ready state (${READY_STATES_TAG})`);
  }

  return value;
}

export function Data(value) {
  if (!Is.Type.String(value) && !Is.Instance.Uint8Array(value)) {
    ThrowTypeError('member', 'a string or a Uint8Array');
  }

  return value;
}
