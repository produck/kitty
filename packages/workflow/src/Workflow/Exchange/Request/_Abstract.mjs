import { SYMBOL } from '@produck/argot';
import Abstract, { Member as M } from '@produck/es-abstract';
import { SubConstructorOf } from '@produck/es-abstract-member-constructor';

import { ThrowDeployer } from '../Utils.mjs';
import * as Part from '../Part/index.mjs';
import * as Header from './Header/index.mjs';
import * as P from './Parser.mjs';
import { PART } from './_Borrow.mjs';
import { I, _I, _S } from './_Symbol.mjs';

class Request extends Part.Concrete {
  [I.HEADER] = null;

  constructor(exchange) {
    super(exchange);
    this[I.HEADER] = new this[SYMBOL.CONSTRUCTOR][_S.HEADER_CTOR](exchange);
  }

  get header() {
    return this[I.HEADER];
  }

  get method() {
    return this[_I.METHOD.GET](this[PART.$I.INTERNAL]);
  }

  get url() {
    const raw = this[_I.URL.GET](this[PART.$I.INTERNAL]);

    try {
      return new URL(raw);
    } catch {
      const host = this.header.get('host');

      if (host === undefined) {
        ThrowDeployer('Host header is required to construct request URL.');
      }

      return new URL(raw, `${this.exchange.protocol}//${host}`);
    }
  }
}

export default Abstract(
  Request,
  Abstract({
    [_I.METHOD.GET]: M.Method().args(M.Any).returns(P.HttpMethod),
    [_I.URL.GET]: M.Method().args(M.Any).returns(M.String),
  }),
  Abstract.Static({
    [_S.HEADER_CTOR]: SubConstructorOf(Header.Abstract),
  }),
);
