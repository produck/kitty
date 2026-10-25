import { Readable } from 'node:stream';

import { Common } from '@produck/argot';
import Abstract, { Member as M } from '@produck/es-abstract';
import * as Fugue from '@produck/fugue';

import * as Configuration from '../../../Configuration/index.mjs';
import * as Workflow from '../../../../Workflow/index.mjs';
import * as Event from './Event.mjs';
import { _A, PART } from './_Borrow.mjs';
import { I, _I } from './_Symbol.mjs';

class HttpRequestBody extends Workflow.Exchange.Part.Concrete {
  constructor(exchange) {
    super(exchange);

    this[I.READABLE] = this[_I.SOURCE.GET](this[PART.$I.INTERNAL]);
    this[I.INIT.DISTRIBUTOR]();
    this[I.INIT.READABLE_EVENT]();
    this[I.INIT.MAX_BODY_SIZE]();
  }

  [I.INIT.DISTRIBUTOR]() {
    const source = Readable.toWeb(this[I.READABLE]);
    const { workflow } = this;
    const { RequestBodyDistributor } = workflow[_A.COMPOUND.$I.STATE];
    const distributor = new RequestBodyDistributor(source);

    for (const { key } of Configuration.Item.Distributor) {
      const value = Configuration.Get[key](workflow);

      Fugue.Options.Tune[key](distributor, value);
    }

    this[I.DISTRIBUTOR] = distributor;
  }

  [I.INIT.READABLE_EVENT]() {
    const readable = this[I.READABLE];

    readable.on('close', () => this.dispatchEvent(new Event.Close()));
    readable.on('end', () => this.dispatchEvent(new Event.End()));
    readable.on('error', (error) => this.dispatchEvent(new Event.Error(error)));
  }

  [I.INIT.MAX_BODY_SIZE]() {
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
      const limit = Configuration.Get.MaxBodySize(this.workflow);

      this.dispatchEvent(new Event.Limit(limit, consumed));
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
  HttpRequestBody,
  Abstract({
    [_I.SOURCE.GET]: M.Method().args(M.Any).returns(M.Instance(Readable)),
  }),
);
