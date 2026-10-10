import Abstract, { Member as M } from '@produck/es-abstract';

import { _I } from './_Symbol.mjs';
import * as Part from '../../Part/index.mjs';
import * as Assert from '../../Parser.mjs';

class AbstractResponseHeader extends Part.Concrete {
  get(key) {
    Assert.HeaderName(key);

    return this[_I.GET](key);
  }

  has(key) {
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

  set(key, value) {
    Assert.HeaderName(key);
    Assert.HeaderValue(value);
    this[_I.SET](key, value);
  }

  delete(key) {
    Assert.HeaderName(key);
    this[_I.DELETE](key);
  }

  clear() {
    for (const key of this.keys()) {
      this.delete(key);
    }
  }
}

export default Abstract(
  AbstractResponseHeader,
  Abstract({
    [_I.GET]: M.Method().args(M.String).returns(M.String),
    [_I.KEYS]: M.Method().returns(Assert.Iterable),
    [_I.SET]: M.Method().args(M.String, M.String).returns(M.Undefined),
    [_I.DELETE]: M.Method().args(M.String).returns(M.Undefined),
  }),
);
