import { SYMBOL } from '@produck/argot';
import Abstract, { Member as M } from '@produck/es-abstract';
import { SubConstructorOf } from '@produck/es-abstract-member-constructor';

import * as P from '../Parser.mjs';
import { I, _I, _S } from './_Symbol.mjs';
import * as Part from '../Part/index.mjs';
import * as Header from './Header/index.mjs';
import * as Body from './Body/index.mjs';
import { ThrowAdapter } from '../Utils.mjs';

class AbstractRequest extends Part.Concrete {
  [I.HEADER] = null;
  [I.BODY] = null;

  constructor(exchange) {
    super(exchange);

    const TargetConstructor = this[SYMBOL.CONSTRUCTOR];

    this[I.HEADER] = new TargetConstructor[_S.HEADER_CTOR](exchange);
    this[I.BODY] = new TargetConstructor[_S.BODY_CTOR](exchange);
    Object.freeze(this);
  }

  get header() {
    return this[I.HEADER];
  }

  get body() {
    return this[I.BODY];
  }

  get method() {
    return this[_I.METHOD.GET]();
  }

  get mode() {
    return this[_I.MODE.GET]();
  }

  get url() {
    const raw = this[_I.URL.GET]();

    try {
      return new URL(raw);
    } catch {
      const host = this.header.get('host');

      if (host === undefined) {
        ThrowAdapter('Host header is required to construct request URL.');
      }

      return new URL(raw, `${this.exchange.protocol}//${host}`);
    }
  }
}

export default Abstract(
  AbstractRequest,
  Abstract({
    [_I.MODE.GET]: M.Method().returns(P.ExchangeMode),
    [_I.METHOD.GET]: M.Method().returns(P.HttpMethod),
    [_I.URL.GET]: M.Method().returns(M.String),
  }),
  Abstract.Static({
    [_S.HEADER_CTOR]: SubConstructorOf(Header.Abstract),
    [_S.BODY_CTOR]: SubConstructorOf(Body.Abstract),
  }),
);
