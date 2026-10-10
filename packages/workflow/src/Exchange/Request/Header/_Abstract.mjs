import Abstract, { Member as M } from '@produck/es-abstract';

import { _I } from './_Symbol.mjs';
import * as Part from '../../Part/index.mjs';
import * as Assert from '../../Parser.mjs';

class AbstractRequestHeader extends Part.Concrete {
  get(key) {
    Assert.HeaderName(key);

    return this[_I.GET](key);
  }

  has(key) {
    Assert.HeaderName(key);

    return this.get(key) !== undefined;
  }

  keys() {
    return this[_I.KEYS]();
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
    [_I.GET]: M.Method().args(M.String).returns(M.String),
    [_I.KEYS]: M.Method().returns(Assert.Iterable),
  }),
);
