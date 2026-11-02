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

export function RejectStatusCode(value) {
  if (!Number.isInteger(value) || value < 400 || value > 599) {
    ThrowTypeError('member', 'a HTTP error status code (integer 400..599)');
  }

  return value;
}

export function RejectReason(value) {
  if (!Is.Type.String(value) || /[\r\n]/.test(value)) {
    ThrowTypeError('member', 'a reason phrase string without CR or LF');
  }

  return value;
}

const CLOSE_CODES_TAG = '1000..1014 (except 1004, 1005, 1006) or 3000..4999';
const CLOSE_REASON_MAX_BYTE_LENGTH = 123;

export function CloseCode(value) {
  if (value === undefined) {
    return value;
  }

  const isStandard =
    value >= 1000 && value <= 1014 && ![1004, 1005, 1006].includes(value);
  const isRegistered = value >= 3000 && value <= 4999;

  if (!Number.isInteger(value) || !(isStandard || isRegistered)) {
    ThrowTypeError('member', `a WebSocket close code (${CLOSE_CODES_TAG})`);
  }

  return value;
}

export function CloseReason(value) {
  if (value === undefined) {
    return value;
  }

  if (!Is.Type.String(value)) {
    ThrowTypeError('member', 'a close reason string or undefined');
  }

  if (Buffer.byteLength(value) > CLOSE_REASON_MAX_BYTE_LENGTH) {
    ThrowTypeError(
      'member',
      `a close reason string within ${CLOSE_REASON_MAX_BYTE_LENGTH} bytes`,
    );
  }

  return value;
}

export function Data(value) {
  if (!Is.Type.String(value) && !Is.Instance.Uint8Array(value)) {
    ThrowTypeError('member', 'a string or a Uint8Array');
  }

  return value;
}
