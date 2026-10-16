import Abstract, { Member as M } from '@produck/es-abstract';

import * as Part from '../../Part/index.mjs';
import * as DataNormalizer from './DataNormalizer/index.mjs';
import { _A, PART, WORKFLOW } from './_Borrow.mjs';
import { I, _I } from './_Symbol.mjs';

const { ReadableStreamResult } = DataNormalizer.Parser;
const NO_BODY = Object.freeze({ stream: null, length: 0 });

class ResponseBody extends Part.Concrete {
  [I.DATA] = NO_BODY;

  get data() {
    const { stream, length } = this[I.DATA];

    return { stream, length };
  }

  set data(value) {
    const registry =
      this.workflow[WORKFLOW.$I.STATE].responseBodyNormalizerRegistry;
    const { stream, length } = registry[_A.REGISTRY.$I.NORMALIZE](value);

    this[I.DATA] = { stream, length };
    this[_I.DATA.SET](this[PART.$I.INTERNAL], { stream, length });
  }
}

export default Abstract(
  ResponseBody,
  Abstract({
    [_I.DATA.SET]: M.Method()
      .args(M.Any, ReadableStreamResult)
      .returns(M.Undefined),
  }),
);
