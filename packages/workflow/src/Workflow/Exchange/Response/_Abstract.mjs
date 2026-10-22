import { SYMBOL } from '@produck/argot';
import Abstract, { Member as M } from '@produck/es-abstract';
import { SubConstructorOf as M_Sub } from '@produck/es-abstract-member-constructor';

import * as P from './_Parser.mjs';
import * as Part from '../Part/index.mjs';
import * as Header from './Header/index.mjs';
import { PART } from './_Borrow.mjs';
import { I, _I, _S } from './_Symbol.mjs';

class Response extends Part.Concrete {
  [I.HEADER] = null;

  constructor(exchange) {
    super(exchange);
    this[I.HEADER] = new this[SYMBOL.CONSTRUCTOR][_S.HEADER_CTOR](exchange);
  }

  get header() {
    return this[I.HEADER];
  }

  get statusCode() {
    return this[_I.STATUS.GET](this[PART.$I.INTERNAL]);
  }

  get statusText() {
    return this[_I.STATUS_TEXT.GET](this[PART.$I.INTERNAL]);
  }

  get isFinished() {
    return this[_I.IS_FINISHED](this[PART.$I.INTERNAL]);
  }
}

export default Abstract(
  Response,
  Abstract({
    [_I.STATUS.GET]: M.Method().args(M.Any).returns(P.HTTPStatusCode),
    [_I.STATUS_TEXT.GET]: M.Method().args(M.Any).returns(M.String),
    [_I.IS_FINISHED]: M.Method().args(M.Any).returns(M.Boolean),
  }),
  Abstract.Static({
    [_S.HEADER_CTOR]: M_Sub(Header.Abstract),
  }),
);
