import Abstract, { Member as M } from '@produck/es-abstract';
import { I, _I } from './Symbol.mjs';
import * as Request from './Request/index.mjs';
import * as Response from './Response/index.mjs';

export default Abstract(
  class KittyTransaction {
    constructor() {
      this[I.CONSTRUCTOR] = new.target;
    }

    get method() {
      return this[_I.METHOD.GET]();
    }

    get URL() {
      return this[_I.URL.GET]();
    }

    get request() {
      return this[_I.REQUEST.GET]();
    }

    get response() {
      return this[_I.RESPONSE.GET]();
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
      [_I.REQUEST.GET]: M.Method().returns(M.Instance(Request.Abstract)),
      [_I.RESPONSE.GET]: M.Method().returns(M.Instance(Response.Abstract)),
      [_I.STATUS.GET]: M.Method().returns(M.Number),
      [_I.STATUS.SET]: M.Method().args(M.Number),
      [_I.FINISHED.IS]: M.Method().returns(M.Boolean),
    }),
  ],
);
