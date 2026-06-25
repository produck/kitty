import * as Ow from '@produck/ow';
import { ThrowTypeError } from '@produck/type-error';
import * as Kit from '@produck/kit';
import * as Composer from '@produck/compose';

import { $I, I, _I } from './Symbol.mjs';

export const K_DEPLOYMENT_SELF = Symbol('DeploymentKit.self');
export const K_WORKFLOW_SELF = Symbol('WorkflowKit.self');
const K_DEPLOYMENT_SERVER = Symbol('DeploymentKit.server');

export const { use: useWorkflow } = Kit.Getter(K_WORKFLOW_SELF);
export const { use: useServer } = Kit.Getter(K_DEPLOYMENT_SERVER);

export function initializeDeploymentKit(DeploymentKit, server) {
  DeploymentKit[K_DEPLOYMENT_SELF] = true;
  DeploymentKit[K_DEPLOYMENT_SERVER] = server;
}

const DEFAULT_PASSTHOUGH = (_ctx, next) => next();

export default class KittyWorkflow {
  [I.CONSTRUCTOR] = KittyWorkflow;
  [$I.WORKFLOW] = DEFAULT_PASSTHOUGH;
  [I.HANDLER_LIST] = [];

  constructor(kit) {
    if (!Kit.isKit(kit)) {
      ThrowTypeError('args[0] as kit', 'Kit');
    }

    this[$I.KIT] = kit('Kitty<Workflow>');
    this[$I.KIT][K_WORKFLOW_SELF] = this;
    this[I.CONSTRUCTOR] = new.target;
    Object.freeze(this);
  }

  [$I.COMPOSE.PREFIX](...handler) {
    this[I.WORKFLOW] = Composer.compose(...handler, this[I.WORKFLOW]);
  }

  use(...handlerList) {
    this[$I.ASSERT.NOT_FINALIZED]();

    for (const index in handlerList) {
      const handler = handlerList[index];

      if (typeof handler !== 'function' || handler.length > 2) {
        ThrowTypeError(`args[${index}] as handler`, '([kit[, next]]) => any');
      }
    }

    this[I.HANDLER_LIST].push(...handlerList);

    return this;
  }

  finalize() {
    this[$I.ASSERT.NOT_FINALIZED]();
    this[$I.COMPOSE.PREFIX](...Object.freeze(this[I.HANDLER_LIST]));
    this[_I.COMPOSE.EXTEND]();

    return this;
  }

  get isFinalized() {
    return this[I.WORKFLOW] !== DEFAULT_PASSTHOUGH;
  }

  [$I.ASSERT.FINALIZED]() {
    if (!this.isFinalized) {
      Ow.throw('It MUST be finalized.');
    }
  }

  [$I.ASSERT.NOT_FINALIZED]() {
    if (this.isFinalized) {
      Ow.throw('It has been finalized.');
    }
  }

  async [I.COMPILE](server) {
    const DeploymentKit = this[$I.KIT]('Kitty<Deployment>');

    initializeDeploymentKit(DeploymentKit, server);

    return this[_I.ADAPTER.COMPILE](DeploymentKit);
  }

  async [I.DEPLOY](server) {
    const { listeners, link } = await this[I.COMPILE](server);

    link(server, listeners);
  }

  async compile(server) {
    this[$I.ASSERT.FINALIZED]();

    const { listeners } = await this[I.COMPILE](server);

    return listeners;
  }

  async deploy(server) {
    this[$I.ASSERT.FINALIZED]();

    return this[I.DEPLOY](server);
  }
}
