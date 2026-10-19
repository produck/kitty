import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import * as Exchange from '../Exchange/index.mjs';
import { Get } from '../Configuration/index.mjs';
import { EXCHANGE } from './_Borrow.mjs';
import { I } from './_Symbol.mjs';

class HttpExchange extends Exchange.Abstract {
  constructor(...args) {
    super(...args);
    this[I.START_TIMING]();
  }

  [I.START_TIMING]() {
    const maxExchangeTimeout = Get.MaxExchangeTimeout(this.workflow);

    const timer = setTimeout(() => {
      if (!this.response.isFinished) {
        this.setStatus(503);
      }
    }, maxExchangeTimeout);

    this.addEventListener('close', () => clearTimeout(timer), { once: true });
  }

  [EXCHANGE._I.MODE]() {
    return 'http';
  }
}

export default SCP(HttpExchange);
