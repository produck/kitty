import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import * as Workflow from '../../Workflow/index.mjs';
import { Get } from '../Configuration/index.mjs';
import * as Event from './Event.mjs';
import { EXCHANGE } from './_Borrow.mjs';
import { I } from './_Symbol.mjs';

class HttpExchange extends Workflow.Exchange.Abstract {
  constructor(...args) {
    super(...args);
    this[I.START_TIMING]();
  }

  [I.START_TIMING]() {
    const maxExchangeTimeout = Get.MaxExchangeTimeout(this.workflow);

    const timer = setTimeout(() => {
      if (!this.response.isFinished) {
        this.dispatchEvent(new Event.Timeout(maxExchangeTimeout));
        this.setStatus(503);
      }
    }, maxExchangeTimeout);

    this.addEventListener(
      'exchange-pipeline-finish',
      () => clearTimeout(timer),
      { once: true },
    );
  }

  [EXCHANGE._I.MODE]() {
    return 'http';
  }
}

export default SCP(HttpExchange);
