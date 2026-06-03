import Abstract, { Member as M } from '@produck/es-abstract';
import { _I } from './Symbol.mjs';

export default Abstract(
  class KittyTransaction {
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

    get finished() {
      return this[_I.FINISHED.GET]();
    }
  },
  ...[
    Abstract({
      [_I.METHOD.GET]: M.Method().returns(M.String),
      [_I.URL.GET]: M.Method().returns(M.String),
      [_I.STATUS.GET]: M.Method().returns(M.Number),
      [_I.STATUS.SET]: M.Method().args(M.Number),
      [_I.FINISHED.GET]: M.Method().returns(M.Boolean),
    }),
  ],
);
