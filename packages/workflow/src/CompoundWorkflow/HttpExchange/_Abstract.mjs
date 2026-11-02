import { CONSTRUCTOR } from '@produck/argot';
import Abstract, { ShadowThis as $ } from '@produck/es-abstract';
import { SubConstructorOf as M_Sub } from '@produck/es-abstract-member-constructor';
import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import * as Workflow from '../../Workflow/index.mjs';
import { Get } from '../Configuration/index.mjs';
import * as Event from './Event.mjs';
import { EXCHANGE } from './_Borrow.mjs';
import { I, _S } from './_Symbol.mjs';

export const K_RESPONSE = Symbol('ExchangeKit.response');

class HttpExchange extends Workflow.Exchange.Abstract {
  [I.RESPONSE] = null;

  constructor(...args) {
    super(...args);

    const response = new this[CONSTRUCTOR][_S.RESPONSE_CTOR]($(this));

    this[I.RESPONSE] = response;
    this[EXCHANGE.$I.KIT][K_RESPONSE] = response;
    this[I.START_TIMING]();
  }

  get response() {
    return this[I.RESPONSE];
  }

  get statusCode() {
    return this[I.RESPONSE].statusCode;
  }

  get statusText() {
    return this[I.RESPONSE].statusText;
  }

  setStatus(code, text) {
    this[I.RESPONSE].setStatus(code, text);
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

export default SCP(
  Abstract(
    HttpExchange,
    Abstract.Static({
      [_S.RESPONSE_CTOR]: M_Sub(Workflow.Exchange.Response.Abstract),
    }),
  ),
);
