import Abstract, { Member as M } from '@produck/es-abstract';

import { _I } from './_Symbol.mjs';
import { PART } from './_Borrow.mjs';
import * as Part from '../../Part/index.mjs';
import * as Assert from '../../Parser.mjs';

class AbstractRequestHeader extends Part.Concrete {
  get(key) {
    Assert.HeaderName(key);

    return this[_I.GET](this[PART.$I.INTERNAL], key);
  }

  has(key) {
    Assert.HeaderName(key);

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
  AbstractRequestHeader,
  Abstract({
    [_I.GET]: M.Method().args(M.Any, M.String).returns(M.String),
    [_I.KEYS]: M.Method().args(M.Any).returns(Assert.Iterable),
  }),
);
