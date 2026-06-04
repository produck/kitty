import Abstract, { Member as M } from '@produck/es-abstract';

import { I, _I } from './Symbol.mjs';
import KittyTransactionRequest from './Request.mjs';
import KittyTransactionResponse from './Response.mjs';

export default Abstract(
  class KittyTransaction {
    request = new KittyTransactionRequest(this);
    response = new KittyTransactionResponse(this);

    constructor() {
      this[I.CONSTRUCTOR] = new.target;
      Object.freeze(this);
    }

    get method() {
      return this[_I.METHOD.GET]();
    }

    get URL() {
      return this[_I.URL.GET]();
    }

    get status() {
      return this[_I.STATUS.GET]();
    }

    set status(value) {
      this[_I.STATUS.SET](value);
    }

    get isFinished() {
      return this[_I.FINISHED.IS]();
    }
  },
  ...[
    Abstract({
      [_I.METHOD.GET]: M.Method().returns(M.String),
      [_I.URL.GET]: M.Method().returns(M.String),
      [_I.STATUS.GET]: M.Method().returns(M.Number),
      [_I.STATUS.SET]: M.Method().args(M.Number),
      [_I.FINISHED.IS]: M.Method().returns(M.Boolean),
      [_I.REQUEST.HEADER.GET]: M.Method().args(M.String).returns(M.Any),
      [_I.REQUEST.HEADER.HAS]: M.Method().args(M.String).returns(M.Boolean),
      [_I.REQUEST.HEADER.KEYS]: M.Method().returns(M.Any),
      [_I.REQUEST.HEADER.ENTRIES]: M.Method().returns(M.Any),
      [_I.REQUEST.BODY.DATA.GET]: M.Method().returns(M.Any),
      [_I.RESPONSE.HEADER.GET]: M.Method().args(M.String).returns(M.Any),
      [_I.RESPONSE.HEADER.HAS]: M.Method().args(M.String).returns(M.Boolean),
      [_I.RESPONSE.HEADER.KEYS]: M.Method().returns(M.Any),
      [_I.RESPONSE.HEADER.ENTRIES]: M.Method().returns(M.Any),
      [_I.RESPONSE.HEADER.SET]: M.Method().args(M.String, M.Any),
      [_I.RESPONSE.HEADER.DELETE]: M.Method().args(M.String),
      [_I.RESPONSE.BODY.DATA.GET]: M.Method().returns(M.Any),
      [_I.RESPONSE.BODY.DATA.SET]: M.Method().args(M.Any),
    }),
  ],
);
