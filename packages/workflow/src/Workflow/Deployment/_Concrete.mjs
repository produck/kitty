import { Ow } from '@produck/argot';
import { compose } from '@produck/compose';

import * as Exchange from '../Exchange/index.mjs';
import { EXCHANGE, WORKFLOW } from './_Borrow.mjs';
import { I, $I } from './_Symbol.mjs';

export const K_DEPLOYMENT_SERVER = Symbol('DeploymentKit.server');

export default class Deployment {
  [I.KIT] = null;
  [I.COMMITTED] = false;
  [I.LINKED] = false;
  [I.WORKFLOW] = null;
  [I.SERVER] = null;
  [I.MANIFEST] = {};
  [I.LINK_LIST] = [];
  [I.HANDLED_EXCHANGE_SET] = new WeakSet();
  [I.EXCHANGE_ATTACHER_LIST] = [];

  constructor(WorkflowKit, workflow, options) {
    const { server, kitName = 'Kitty<Deployment>' } = options;

    this[I.KIT] = WorkflowKit(kitName);
    this[I.SERVER] = server;
    this[I.WORKFLOW] = workflow;
    this[I.KIT][K_DEPLOYMENT_SERVER] = server;
  }

  get manifest() {
    return this[I.MANIFEST];
  }

  get [$I.KIT]() {
    return this[I.KIT];
  }

  get [$I.WORKFLOW]() {
    return this[I.WORKFLOW];
  }

  get [$I.SERVER]() {
    return this[I.SERVER];
  }

  get [$I.COMMITTED]() {
    return this[I.COMMITTED];
  }

  [$I.COMMIT]() {
    this[I.COMMITTED] = true;
  }

  [$I.DECLARE](name, value) {
    this[I.MANIFEST][name] = value;
  }

  [$I.SET_LINKER](linker) {
    this[I.LINK_LIST].unshift(linker);
  }

  async [$I.HANDLE_EXCHANGE](TargetExchange, internal) {
    const identity = TargetExchange[EXCHANGE.$S.IDENTITY](internal);

    if (this[$I.HAS_EXCHANGE](identity)) {
      Ow.Error.Common('The Exchange has already been dispatched.');
    }

    this[$I.REGISTER_EXCHANGE](identity);

    const exchange = new TargetExchange(this[I.KIT], this, { internal });
    const ExchangeKit = exchange[EXCHANGE.$I.KIT];

    this[$I.ATTACH_EXCHANGE](ExchangeKit);

    try {
      await this[I.WORKFLOW][WORKFLOW.$I.PIPELINE](ExchangeKit);
      exchange.dispatchEvent(new Exchange.Event.Done());
    } catch (error) {
      exchange.dispatchEvent(new Exchange.Event.Error(error));

      throw error;
    } finally {
      exchange.dispatchEvent(new Exchange.Event.Finish());
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
