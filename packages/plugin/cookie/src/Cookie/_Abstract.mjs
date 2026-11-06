import Abstract, { Member as M } from '@produck/es-abstract';

import { Concrete as CookieParser } from './Parser/index.mjs';
import * as P from './_Parser.mjs';
import { I, $I, _I } from './_Symbol.mjs';

class Cookie {
  [I.PARSED] = null;

  get size() {
    return this[$I.PARSED].size;
  }

  has(name) {
    return this[$I.PARSED].has(name);
  }

  get(name) {
    return this[$I.PARSED].get(name);
  }

  keys() {
    return this[$I.PARSED].keys();
  }

  values() {
    return this[$I.PARSED].values();
  }

  entries() {
    return this[$I.PARSED].entries();
  }

  [Symbol.iterator]() {
    return this.values();
  }

  set(name, value, options) {
    const record = {
      name: P.CookieName(name),
      value: P.CookieValue(value),
      ...P.CookieOptions(options),
    };

    this[_I.WRITE](P.serializeSetCookie(record));
  }

  get [$I.PARSED]() {
    if (this[I.PARSED] === null) {
      this[I.PARSED] = new CookieParser(P.parseCookieHeader(this[_I.READ]()));
    }

    return this[I.PARSED];
  }
}

export default Abstract(
  Cookie,
  Abstract({
    [_I.READ]: M.Method().returns(M.String),
    [_I.WRITE]: M.Method().args(M.String).returns(M.Undefined),
  }),
);
