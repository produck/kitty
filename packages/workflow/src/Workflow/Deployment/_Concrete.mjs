import { Ow, ThrowTypeError } from '@produck/argot';
import * as Kit from '@produck/kit';
import { compose } from '@produck/compose';

import { K_DEPLOYMENT_SERVER } from '../../Capability.mjs';
import { EXCHANGE, WORKFLOW } from './_Borrow.mjs';
import { I, $I } from './_Symbol.mjs';

export default class Deployment {
  [I.KIT] = null;
  [I.COMMITTED] = false;
  [I.LINKED] = false;
  [I.WORKFLOW] = null;
  [I.SERVER] = null;
  [I.LISTENERS] = {};
  [I.LINK_LIST] = [];
  [I.HANDLED_EXCHANGE_SET] = new WeakSet();
  [I.EXCHANGE_ATTACHER_LIST] = [];

  constructor(DeploymentKit, server, workflow) {
    if (!Kit.isKit(DeploymentKit)) {
      ThrowTypeError('args[0] as DeploymentKit', 'Kit');
    }

    this[I.KIT] = DeploymentKit;
    this[I.SERVER] = server;
    this[I.WORKFLOW] = workflow;
    DeploymentKit[K_DEPLOYMENT_SERVER] = server;
  }

  get listeners() {
    return this[I.LISTENERS];
  }

  get [$I.KIT]() {
    return this[I.KIT];
  }

  get [$I.SERVER]() {
    return this[I.SERVER];
  }

  get [$I.COMMITTED]() {
    return this[I.COMMITTED];
  }

  get [$I.LINKED]() {
    return this[I.LINKED];
  }

  [$I.COMMIT]() {
    this[I.COMMITTED] = true;
  }

  [$I.SET_LISTENER](eventName, listener) {
    this[I.LISTENERS][eventName] = listener;
  }

  [$I.SET_LINKER](linker) {
    this[I.LINK_LIST].unshift(linker);
  }

  async [$I.HANDLE_EXCHANGE](Exchange, internal) {
    const ExchangeKit = this[I.KIT]('Kitty<Exchange>');
    const exchange = new Exchange(ExchangeKit, internal);
    const identity = exchange[EXCHANGE.$I.IDENTITY];

    if (this[$I.HAS_EXCHANGE](identity)) {
      Ow.Error.Common('The Exchange has already been dispatched.');
    }

    this[$I.REGISTER_EXCHANGE](identity);
    this[$I.ATTACH_EXCHANGE](ExchangeKit);

    try {
      await this[I.WORKFLOW][WORKFLOW.$I.PIPELINE](ExchangeKit);
    } finally {
      exchange.dispatchEvent(new Event('close'));
    }
  }

  [$I.REGISTER_EXCHANGE](identity) {
    this[I.HANDLED_EXCHANGE_SET].add(identity);
  }

  [$I.HAS_EXCHANGE](identity) {
    return this[I.HANDLED_EXCHANGE_SET].has(identity);
  }

  [$I.ADD_EXCHANGE_ATTACHER](attacher) {
    this[I.EXCHANGE_ATTACHER_LIST].push(attacher);
  }

  [$I.ATTACH_EXCHANGE](ExchangeKit) {
    for (const attacher of this[I.EXCHANGE_ATTACHER_LIST]) {
      attacher(ExchangeKit);
    }
  }

  link() {
    if (this[I.LINKED]) {
      Ow.Error.Common('Deployment has already been linked.');
    }

    this[I.LINKED] = true;
    compose(...this[I.LINK_LIST])();
  }
}
