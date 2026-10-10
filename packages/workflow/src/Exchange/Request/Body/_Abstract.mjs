import { Readable } from 'node:stream';
import Abstract, { Member as M } from '@produck/es-abstract';

import { _I } from './_Symbol.mjs';
import * as Part from '../../Part/index.mjs';

class AbstractRequestBody extends Part.Concrete {
  get data() {
    return this[_I.DATA.GET]();
  }
}

export default Abstract(
  AbstractRequestBody,
  Abstract({
    [_I.DATA.GET]: M.Method().returns(M.Instance(Readable)),
  }),
);
