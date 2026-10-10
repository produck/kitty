import Abstract, { Member as M } from '@produck/es-abstract';

import { _I } from './_Symbol.mjs';
import * as Part from '../../Part/index.mjs';

class AbstractResponseBody extends Part.Concrete {
  get data() {
    return this[_I.DATA.GET]();
  }

  set data(value) {
    this[_I.DATA.SET](value);
  }
}

export default Abstract(
  AbstractResponseBody,
  Abstract({
    [_I.DATA.GET]: M.Method().returns(M.Any),
    [_I.DATA.SET]: M.Method().args(M.Any).returns(M.Undefined),
  }),
);
