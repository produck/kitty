import { Ow, ThrowTypeError } from '@produck/argot';
import * as Kit from '@produck/kit';
import Abstract, { Member as M, ShadowThis as $ } from '@produck/es-abstract';
import * as Composer from '@produck/compose';

import { I, $I, _I } from './_Symbol.mjs';
import * as Deployment from './Deployment/index.mjs';
import { K_WORKFLOW } from '../Capability.mjs';
import * as P from './_Parser.mjs';

const DEFAULT_PASSTHROUGH = (_ctx, next) => next();

class Workflow {
  [I.HANDLER_LIST] = [];
  [$I.PIPELINE] = DEFAULT_PASSTHROUGH;

  constructor(kit) {
    if (!Kit.isKit(kit)) {
      ThrowTypeError('args[0] as kit', 'Kit');
    }

    const WorkflowKit = kit('Kitty<Workflow>');

    this[I.KIT] = WorkflowKit;
    WorkflowKit[K_WORKFLOW] = $(this);
  }
  get [$I.KIT]() {
    return this[I.KIT];
  }
  [$I.COMPOSE.PREPEND](...handler) {
    this[$I.PIPELINE] = Composer.compose(...handler, this[$I.PIPELINE]);
  }

  use(...handlerList) {
    this[$I.ASSERT.NOT_FINALIZED]();

    for (const index in handlerList) {
      P.Handler(handlerList[index], index);
    }

    this[I.HANDLER_LIST].push(...handlerList);

    return this;
  }

  finalize() {
    this[$I.ASSERT.NOT_FINALIZED]();
    this[$I.COMPOSE.PREPEND](...Object.freeze(this[I.HANDLER_LIST]));
    this[_I.COMPOSE.EXTEND]();
    Object.freeze(this);

    return this;
  }

  get isFinalized() {
    return Object.isFrozen(this);
  }

  [$I.ASSERT.FINALIZED]() {
    if (!this.isFinalized) {
      Ow.Error.Common('It MUST be finalized.');
    }
  }

  [$I.ASSERT.NOT_FINALIZED]() {
    if (this.isFinalized) {
      Ow.Error.Common('It has been finalized.');
    }
  }

  async [$I.COMPILE](
    server,
    DeploymentKit = this[$I.KIT]('Kitty<Deployment>'),
  ) {
    const deployment = new Deployment.Concrete(DeploymentKit, server, this);

    await this[_I.COMPILE_DEPLOYMENT](deployment);

    return deployment;
  }

  async [$I.DEPLOY](server, DeploymentKit) {
    const deployment = await this[$I.COMPILE](server, DeploymentKit);

    deployment.link();
  }

  async compile(server) {
    this[$I.ASSERT.FINALIZED]();

    const deployment = await this[$I.COMPILE](server);

    return deployment.listeners;
  }

  async deploy(server) {
    this[$I.ASSERT.FINALIZED]();

    return this[$I.DEPLOY](server);
  }
}

export default Abstract(
  Workflow,
  Abstract({
    [_I.COMPOSE.EXTEND]: M.Method(),
    [_I.COMPILE_DEPLOYMENT]: M.Method(),
  }),
);
