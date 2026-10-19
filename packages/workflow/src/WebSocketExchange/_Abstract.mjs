import { SYMBOL } from '@produck/argot';
import Abstract, { ShadowThis as $ } from '@produck/es-abstract';
import { SubConstructorOf } from '@produck/es-abstract-member-constructor';

import * as Exchange from '../Exchange/index.mjs';
import * as Controller from './Controller/index.mjs';
import { EXCHANGE } from './_Borrow.mjs';
import { I, _S } from './_Symbol.mjs';

class WebSocketExchange extends Exchange.Abstract {
  [I.CONTROLLER] = null;

  constructor(ExchangeKit, internal) {
    super(ExchangeKit, internal);

    const TargetController = this[SYMBOL.CONSTRUCTOR][_S.CONTROLLER_CTOR];

    this[I.CONTROLLER] = new TargetController($(this));
  }

  get controller() {
    return this[I.CONTROLLER];
  }

  get webSocket() {
    return this.controller;
  }

  get ws() {
    return this.controller;
  }

  [EXCHANGE._I.MODE]() {
    return 'websocket';
  }
}

export default Abstract(
  WebSocketExchange,
  Abstract.Static({
    [_S.CONTROLLER_CTOR]: SubConstructorOf(Controller.Abstract),
  }),
);
