import Abstract, { Member as M } from '@produck/es-abstract';

import * as Header from '../Header/index.mjs';
import * as P from './_Parser.mjs';
import { PART } from './_Borrow.mjs';
import { _I } from './_Symbol.mjs';

class MutableResponseHeader extends Header.Abstract {
  set(key, value) {
    P.HeaderName(key);
    P.HeaderValue(value);
    this[_I.SET](this[PART.$I.INTERNAL], key, value);
  }

  delete(key) {
    P.HeaderName(key);
    this[_I.DELETE](this[PART.$I.INTERNAL], key);
  }

  clear() {
    for (const key of this.keys()) {
      this.delete(key);
    }
  }
}

export default Abstract(
  MutableResponseHeader,
  Abstract({
    [_I.SET]: M.Method().args(M.Any, M.String, M.String).returns(M.Undefined),
    [_I.DELETE]: M.Method().args(M.Any, M.String).returns(M.Undefined),
  }),
);
