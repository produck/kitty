import { SYMBOL } from '@produck/argot';
import Abstract, { ShadowThis as $ } from '@produck/es-abstract';
import { SubConstructorOf } from '@produck/es-abstract-member-constructor';

import { K_CONTROLLER } from '../../Capability.mjs';
import * as Workflow from '../../Workflow/index.mjs';
import * as Controller from './Controller/index.mjs';
import { EXCHANGE } from './_Borrow.mjs';
import { I, _S } from './_Symbol.mjs';

class WebSocketExchange extends Workflow.Exchange.Abstract {
  [I.CONTROLLER] = null;

  constructor(...args) {
    super(...args);

    const TargetController = this[SYMBOL.CONSTRUCTOR][_S.CONTROLLER_CTOR];
    const controller = new TargetController($(this));

    this[I.CONTROLLER] = controller;
    this[EXCHANGE.$I.KIT][K_CONTROLLER] = controller;
  }

  get controller() {
    return this[I.CONTROLLER];
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
