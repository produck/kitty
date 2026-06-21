import * as Ow from '@produck/ow';
import { ThrowTypeError } from '@produck/type-error';
import * as Kit from '@produck/kit';
import * as Composer from '@produck/compose';

import { $I, I, _I } from './Symbol.mjs';

export const K_DEPLOYMENT_SELF = Symbol('DeploymentKit.self');
const K_DEPLOYMENT_SERVER = Symbol('DeploymentKit.server');
const K_DEPLOYMENT_OPTIONS = Symbol('DeploymentKit.options');

export const { use: useServer } = Kit.Getter(K_DEPLOYMENT_SERVER);
export const { use: useOptions } = Kit.Getter(K_DEPLOYMENT_OPTIONS);

const DEFAULT_PASSTHOUGH = (_ctx, next) => next();

export default class KittyWorkflow {
  [I.CONSTRUCTOR] = KittyWorkflow;
  [$I.WORKFLOW] = DEFAULT_PASSTHOUGH;
  [I.HANDLER_LIST] = [];

  constructor(kit) {
    if (!Kit.isKit(kit)) {
      ThrowTypeError('args[0] as kit', 'Kit');
    }

    this[I.KIT] = kit('Kitty<Workflow>');
    this[I.CONSTRUCTOR] = new.target;
    Object.freeze(this);
  }

  [$I.COMPOSE.PREFIX](...handler) {
    this[I.WORKFLOW] = Composer.compose(...handler, this[I.WORKFLOW]);
  }

  [$I.COMPOSE.SUFFIX](...handler) {
    this[I.WORKFLOW] = Composer.compose(this[I.WORKFLOW], ...handler);
  }

  use(...handlerList) {
    if (this.isFinal) {
      Ow.throw('It has been finalized.');
    }

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
    if (this.isFinal) {
      Ow.throw('It has been finalized.');
    }

    this[$I.COMPOSE.PREFIX](...Object.freeze(this[I.HANDLER_LIST]));
    this[_I.COMPOSE.EXTEND]();

    return this;
  }

  get isFinal() {
    return this[I.WORKFLOW] !== DEFAULT_PASSTHOUGH;
  }

  [I.ASSERT.FINALIZED]() {
    if (!this.isFinal) {
      Ow.throw('It MUST be finalized.');
    }
  }

  async [I.COMPILE](server, options) {
    const DeploymentKit = this[I.KIT]('Kitty<Deployment>');

    DeploymentKit[K_DEPLOYMENT_SELF] = true;
    DeploymentKit[K_DEPLOYMENT_SERVER] = server;
    DeploymentKit[K_DEPLOYMENT_OPTIONS] = options;

    const listeners = this[_I.ADAPTER.COMPILE](DeploymentKit);

    //TODO check listeners shape

    return listeners;
  }

  async [I.DEPLOY](server, options) {
    const listeners = this[I.COMPILE](server, options);

    await this[_I.ADAPTER.LINK](server, listeners);

    return true;
  }

  async compile(server, ...args) {
    this[I.ASSERT.FINALIZED]();

    //TODO args.length <= 1 as options of deployment.

    return this[_I.COMPILE](server, ...args);
  }

  async deploy(server, ...args) {
    this[I.ASSERT.FINALIZED]();
    this[I.COMPILE](server, ...args);

    //TODO args.length <= 1 as options of deployment.

    return this[I.DEPLOY](server, ...args);
  }

  adapt() {
    this[I.ASSERT.FINALIZED]();

    const compileOnce = async (server, options) => {
      const { listeners: record } = await this[I.COMPILE](server, options);

      return record;
    };

    const deployOnce = (server, options) => {
      return this[I.DEPLOY](server, options);
    };

    return Object.freeze({ compile: compileOnce, deploy: deployOnce });
  }
}
