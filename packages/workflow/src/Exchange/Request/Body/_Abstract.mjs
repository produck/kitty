import { Readable } from 'node:stream';

import Abstract, { Member as M } from '@produck/es-abstract';
import * as Fugue from '@produck/fugue';

import { useWorkflow } from '../../../Capability.mjs';
import * as Configuration from '../../../Configuration/index.mjs';
import * as Part from '../../Part/index.mjs';
import { EXCHANGE, PART, WORKFLOW } from './_Borrow.mjs';
import { I, _I, A } from './_Symbol.mjs';

class RequestBody extends Part.Concrete {
  [I.DISTRIBUTOR] = null;

  constructor(exchange) {
    super(exchange);

    const source = Readable.toWeb(this[_I.SOURCE.GET](this[PART.$I.INTERNAL]));
    const ExchangeKit = this[PART.I.EXCHANGE][EXCHANGE.$I.KIT];
    const distributor = new this[A.I.DISTRIBUTOR_CTOR](source);
    const workflow = useWorkflow(ExchangeKit);

    for (const { key } of Configuration.Item.Distributor) {
      const value = Configuration.Get[`get${key}`](workflow);

      Fugue.Options.Tune[key](distributor, value);
    }

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
  RequestBody,
  Abstract({
    [_I.SOURCE.GET]: M.Method().args(M.Any).returns(M.Instance(Readable)),
  }),
);
