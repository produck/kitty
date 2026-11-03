import { Readable } from 'node:stream';

import { ignoreRejection, Ow } from '@produck/argot';
import Abstract, { Member as M } from '@produck/es-abstract';
import * as Fugue from '@produck/fugue';

import * as Configuration from '../../../Configuration/index.mjs';
import * as Workflow from '../../../../Workflow/index.mjs';
import * as Event from './Event.mjs';
import { _A, PART } from './_Borrow.mjs';
import { I, _I } from './_Symbol.mjs';

class HttpRequestBody extends Workflow.Exchange.Part.Concrete {
  [I.READABLE] = null;
  [I.DISTRIBUTOR] = null;
  [I.RAW] = false;

  constructor(exchange) {
    super(exchange);

    this[I.READABLE] = this[_I.SOURCE.GET](this[PART.$I.INTERNAL]);
    this[I.INIT.READABLE_EVENT]();
  }

  get source() {
    return this[I.READABLE];
  }

  claimRaw() {
    if (this[I.DISTRIBUTOR] !== null) {
      Ow.Error.Common('The body is already on the distributor path.');
    }

    this[I.RAW] = true;
  }

  [I.REQUIRE.DISTRIBUTOR]() {
    if (this[I.RAW]) {
      Ow.Error.Common('The body is already on the raw stream path.');
    }

    if (this[I.DISTRIBUTOR] === null) {
      this[I.INIT.DISTRIBUTOR]();
      this[I.INIT.MAX_BODY_SIZE]();
    }

    return this[I.DISTRIBUTOR];
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
      ignoreRejection(distributor.destroy());

      if (!response.isFinished) {
        response.setStatus(413);
      }
    });
  }

  get data() {
    return this[I.REQUIRE.DISTRIBUTOR]().fork();
  }

  get distributor() {
    return this[I.REQUIRE.DISTRIBUTOR]();
  }
}

export default Abstract(
  HttpRequestBody,
  Abstract({
    [_I.SOURCE.GET]: M.Method().args(M.Any).returns(M.Instance(Readable)),
  }),
);
