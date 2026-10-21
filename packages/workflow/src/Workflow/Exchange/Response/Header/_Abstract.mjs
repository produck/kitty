import Abstract, { Member as M } from '@produck/es-abstract';

import { _I } from './_Symbol.mjs';
import { PART } from './_Borrow.mjs';
import * as Part from '../../Part/index.mjs';
import * as Parser from '../../Parser.mjs';

class ResponseHeader extends Part.Concrete {
  get(key) {
    Parser.HeaderName(key);

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

  set(key, value) {
    Parser.HeaderName(key);
    Parser.HeaderValue(value);
    this[_I.SET](this[PART.$I.INTERNAL], key, value);
  }

  delete(key) {
    Parser.HeaderName(key);
    this[_I.DELETE](this[PART.$I.INTERNAL], key);
  }

  clear() {
    for (const key of this.keys()) {
      this.delete(key);
    }
  }
}

export default Abstract(
  ResponseHeader,
  Abstract({
    [_I.GET]: M.Method()
      .args(M.Any, M.String)
      .returns(Parser.HeaderValueOrUndefined),
    [_I.KEYS]: M.Method().args(M.Any).returns(Parser.Iterable),
    [_I.SET]: M.Method().args(M.Any, M.String, M.String).returns(M.Undefined),
    [_I.DELETE]: M.Method().args(M.Any, M.String).returns(M.Undefined),
  }),
);
