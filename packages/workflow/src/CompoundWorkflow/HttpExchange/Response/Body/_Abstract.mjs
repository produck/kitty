import Abstract, { Member as M } from '@produck/es-abstract';

import * as Workflow from '../../../../Workflow/index.mjs';
import { _A, PART } from './_Borrow.mjs';
import { I, _I } from './_Symbol.mjs';
import { ReadableStreamResult } from './Parser.mjs';

const NO_BODY = Object.freeze({ stream: null, length: 0 });

class HttpResponseBody extends Workflow.Exchange.Part.Concrete {
  [I.DATA] = NO_BODY;

  get data() {
    const { stream, length } = this[I.DATA];

    return { stream, length };
  }

  set data(value) {
    const result = this.workflow[_A.COMPOUND.A.$I.NORMALIZE_DATA](value);

    this[I.DATA] = { stream: result.stream, length: result.length };
    this[_I.DATA.SET](this[PART.$I.INTERNAL], { ...this[I.DATA] });
  }
}

export default Abstract(
  HttpResponseBody,
  Abstract({
    [_I.DATA.SET]: M.Method()
      .args(M.Any, ReadableStreamResult)
      .returns(M.Undefined),
  }),
);
