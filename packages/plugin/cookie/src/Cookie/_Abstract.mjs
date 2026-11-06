import Abstract, { Member as M } from '@produck/es-abstract';

import CookieParser from '../CookieParser/_Concrete.mjs';
import { parseCookieHeader } from '../CookieParser/_Parser.mjs';
import { CookieName, CookieValue } from '../_Parser.mjs';
import { CookieOptions } from './_Parser.mjs';
import { serializeSetCookie } from './_Serializer.mjs';
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
      name: CookieName(name),
      value: CookieValue(value),
      ...CookieOptions(options),
    };

    this[_I.WRITE](serializeSetCookie(record));
  }

  get [$I.PARSED]() {
    if (this[I.PARSED] === null) {
      this[I.PARSED] = new CookieParser(parseCookieHeader(this[_I.READ]()));
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
