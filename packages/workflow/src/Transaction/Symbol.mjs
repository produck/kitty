import { deepFreeze } from '@produck/deep-freeze-enumerable';

export const I = deepFreeze({});

const _I_METHOD_GET = Symbol('._methodGet');
const _I_URL_GET = Symbol('._urlGet');
const _I_STATUS_GET = Symbol('._statusGet');
const _I_STATUS_SET = Symbol('._statusSet');
const _I_FINISHED_GET = Symbol('._finishedGet');

export const _I = deepFreeze({
  METHOD: {
    GET: _I_METHOD_GET,
  },
  URL: {
    GET: _I_URL_GET,
  },
  STATUS: {
    GET: _I_STATUS_GET,
    SET: _I_STATUS_SET,
  },
  FINISHED: {
    GET: _I_FINISHED_GET,
  },
});

export const S = deepFreeze({});

export const _S = deepFreeze({});
