import { Readable } from 'node:stream';

import Abstract, { Member as M } from '@produck/es-abstract';

import { useWorkflow } from '../../../Capability.mjs';
import * as Part from '../../Part/index.mjs';
import { I, _I, A } from './_Symbol.mjs';
import { EXCHANGE, PART, WORKFLOW } from './_Borrow.mjs';

class AbstractRequestBody extends Part.Concrete {
  [I.DISTRIBUTOR] = null;

  constructor(exchange) {
    super(exchange);

    const source = Readable.toWeb(this[_I.SOURCE.GET](this[PART.$I.INTERNAL]));
    const distributor = new this[A.I.DISTRIBUTOR_CTOR](source);

    this[I.DISTRIBUTOR] = distributor;
  }

  get [A.I.DISTRIBUTOR_CTOR]() {
    const ExchangeKit = this[PART.I.EXCHANGE][EXCHANGE.$I.KIT];
    const workflow = useWorkflow(ExchangeKit);

    return workflow[WORKFLOW.$I.STATE].ReadableStreamDistributor;
  }

  get data() {
    return this[I.DISTRIBUTOR].fork();
  }
}

export default Abstract(
  AbstractRequestBody,
  Abstract({
    [_I.SOURCE.GET]: M.Method().args(M.Any).returns(M.Instance(Readable)),
  }),
);
