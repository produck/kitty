import { SYMBOL } from '@produck/argot';
import Abstract, { Member as M } from '@produck/es-abstract';

import * as P from './Parser.mjs';
import { _I, $I, _S } from './_Symbol.mjs';

class ResponseBodyDataNormalizer {
  constructor() {
    this[SYMBOL.CONSTRUCTOR] = new.target;
  }

  static test(value) {
    return this[_S.TEST](value);
  }

  [$I.TEST](value) {
    return this[SYMBOL.CONSTRUCTOR][_S.TEST](value);
  }

  [$I.NORMALIZE](value) {
    return this[_I.NORMALIZE](value);
  }
}

export default Abstract(
  ResponseBodyDataNormalizer,
  Abstract({
    [_I.NORMALIZE]: M.Method().args(M.Any).returns(P.ReadableStreamResult),
  }),
  Abstract.Static({
    [_S.TEST]: M.Method().args(M.Any).returns(M.Boolean),
  }),
);
