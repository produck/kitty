import { Readable } from 'node:stream';

import { Common } from '@produck/argot';
import Abstract, { Member as M } from '@produck/es-abstract';
import * as Fugue from '@produck/fugue';

import * as Configuration from '../../../Configuration/index.mjs';
import * as Part from '../../Part/index.mjs';
import { PART, WORKFLOW } from './_Borrow.mjs';
import { I, _I } from './_Symbol.mjs';

class RequestBody extends Part.Concrete {
  [I.DISTRIBUTOR] = null;

  constructor(exchange) {
    super(exchange);

    const source = Readable.toWeb(this[_I.SOURCE.GET](this[PART.$I.INTERNAL]));
    const { workflow } = this;
    const { RequestBodyDistributor } = workflow[WORKFLOW.$I.STATE];
    const distributor = new RequestBodyDistributor(source);

    for (const { key } of Configuration.Item.Distributor) {
      const value = Configuration.Get[key](workflow);

      Fugue.Options.Tune[key](distributor, value);
    }

    this[I.DISTRIBUTOR] = distributor;

    this[I.MAX_BODY_SIZE]();
  }

  [I.MAX_BODY_SIZE]() {
    const distributor = this[I.DISTRIBUTOR];
    let consumed = 0;

    distributor.addEventListener('metric', (event) => {
      const { code, delta } = event.detail;

      if (distributor.terminated || code !== 'source-consumed-byte-length') {
        return;
      }

      consumed += delta;

      if (consumed <= Configuration.Get.MaxBodySize(this.workflow)) {
        return;
      }

      const { response } = this.exchange;

      Common.ignoreRejection(distributor.destroy());

      if (!response.isFinished) {
        response.setStatus(413);
      }
    });
  }

  get data() {
    return this[I.DISTRIBUTOR].fork();
  }

  get distributor() {
    return this[I.DISTRIBUTOR];
  }
}

export default Abstract(
  RequestBody,
  Abstract({
    [_I.SOURCE.GET]: M.Method().args(M.Any).returns(M.Instance(Readable)),
  }),
);
