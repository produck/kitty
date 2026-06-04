import { deepFreeze } from '@produck/deep-freeze-enumerable';

export const I = deepFreeze({});

const _I_HEADER_GET = Symbol('._getHeader(key)');
const _I_HEADER_HAS = Symbol('._hasHeader(key)');
const _I_HEADER_KEYS = Symbol('._headerKeys()');
const _I_HEADER_ENTRIES = Symbol('._headerEntries()');
const _I_BODY_DATA_GET = Symbol('._getBodyData()');

export const _I = deepFreeze({
  HEADER: {
    GET: _I_HEADER_GET,
    HAS: _I_HEADER_HAS,
    KEYS: _I_HEADER_KEYS,
    ENTRIES: _I_HEADER_ENTRIES,
  },
  BODY: {
    DATA: {
      GET: _I_BODY_DATA_GET,
    },
  },
});

export const S = deepFreeze({});

export const _S = deepFreeze({});
