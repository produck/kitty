import Abstract, { Member as M } from '@produck/es-abstract';

import { _I } from './_Symbol.mjs';
import { PART } from './_Borrow.mjs';
import * as Part from '../../Part/index.mjs';
import * as P from './_Parser.mjs';

class ResponseHeader extends Part.Concrete {
  get(key) {
    P.HeaderName(key);

    return this[_I.GET](this[PART.$I.INTERNAL], key);
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  keys() {
    return this[_I.KEYS](this[PART.$I.INTERNAL]);
  }

  *entries() {
    for (const key of this.keys()) {
      yield [key, this.get(key)];
    }
  }
}

export default Abstract(
  ResponseHeader,
  Abstract({
    [_I.GET]: M.Method()
      .args(M.Any, M.String)
      .returns(P.HeaderValueOrUndefined),
    [_I.KEYS]: M.Method().args(M.Any).returns(P.Iterable),
  }),
);
