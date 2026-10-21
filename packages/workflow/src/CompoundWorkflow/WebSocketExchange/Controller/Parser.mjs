import { ThrowTypeError } from '@produck/argot';

const READY_STATES = Object.freeze([0, 1, 2, 3]);
const READY_STATES_TAG = READY_STATES.join(' | ');

export function ReadyState(value) {
  if (!Number.isInteger(value) || !READY_STATES.includes(value)) {
    ThrowTypeError('member', `a WebSocket ready state (${READY_STATES_TAG})`);
  }

  return value;
}

export function Data(value) {
  if (typeof value !== 'string' && !(value instanceof Uint8Array)) {
    ThrowTypeError('member', 'a string or a Uint8Array');
  }

  return value;
}
