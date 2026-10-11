import { METHODS } from 'node:http';

import { ThrowTypeError } from '@produck/argot';

export function HttpMethod(value) {
  if (typeof value !== 'string' || !METHODS.includes(value)) {
    ThrowTypeError('member', 'a HTTP method');
  }

  return value;
}

const MODES = Object.freeze(['http', 'websocket']);
const MODES_TAG = MODES.map((v) => `'${v}'`).join(' | ');

export function ExchangeMode(value) {
  if (typeof value !== 'string' || !MODES.includes(value)) {
    ThrowTypeError('member', `a HTTP exchange mode (${MODES_TAG})`);
  }

  return value;
}
