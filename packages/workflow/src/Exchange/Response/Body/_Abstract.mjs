import Abstract, { Member as M } from '@produck/es-abstract';

import { _I } from './_Symbol.mjs';
import { PART } from './_Borrow.mjs';
import * as Part from '../../Part/index.mjs';

class AbstractResponseBody extends Part.Concrete {
  get data() {
    return this[_I.DATA.GET](this[PART.$I.INTERNAL]);
  }

  set data(value) {
    this[_I.DATA.SET](this[PART.$I.INTERNAL], value);
  }
}

export default Abstract(
  AbstractResponseBody,
  Abstract({
    [_I.DATA.GET]: M.Method().args(M.Any).returns(M.Any),
    [_I.DATA.SET]: M.Method().args(M.Any, M.Any).returns(M.Undefined),
  }),
);
