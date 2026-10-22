import Abstract, { Member as M } from '@produck/es-abstract';
import { SubConstructorOf as M_Sub } from '@produck/es-abstract-member-constructor';

import * as Response from '../Response/index.mjs';
import * as P from './_Parser.mjs';
import { PART, RESPONSE } from './_Borrow.mjs';
import { _I } from './_Symbol.mjs';

class MutableResponse extends Response.Abstract {
  setStatus(code, text) {
    P.HTTPStatusCode(code);
    this[_I.STATUS.SET](this[PART.$I.INTERNAL], code);

    if (text !== undefined) {
      P.HeaderValue(text);
      this[_I.STATUS_TEXT.SET](this[PART.$I.INTERNAL], text);
    }
  }
}

export default Abstract(
  MutableResponse,
  Abstract({
    [_I.STATUS.SET]: M.Method()
      .args(M.Any, P.HTTPStatusCode)
      .returns(M.Undefined),
    [_I.STATUS_TEXT.SET]: M.Method().args(M.Any, M.String).returns(M.Undefined),
  }),
  Abstract.Static({
    [RESPONSE._S.HEADER_CTOR]: M_Sub(Response.MutableHeader.Abstract),
  }),
);
