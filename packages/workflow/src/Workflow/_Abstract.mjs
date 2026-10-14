import { Ow, ThrowTypeError } from '@produck/argot';
import * as Kit from '@produck/kit';
import { isSubConstructor } from '@produck/is-sub-constructor';
import Abstract, { Member as M, ShadowThis as $ } from '@produck/es-abstract';
import * as Composer from '@produck/compose';
import * as Fugue from '@produck/fugue';

import * as Exchange from '../Exchange/index.mjs';
import { I, $I, _I } from './_Symbol.mjs';
import { K_WORKFLOW, K_DEPLOYMENT_SERVER } from '../Capability.mjs';
import { assertHandlerByIndex } from './Assert.mjs';

const DEFAULT_PASSTHROUGH = (_ctx, next) => next();

class KittyWorkflow {
  [I.HANDLER_LIST] = [];
  [$I.STATE] = { ReadableStreamDistributor: null };
  [$I.WORKFLOW] = DEFAULT_PASSTHROUGH;

  constructor(kit) {
    if (!Kit.isKit(kit)) {
      ThrowTypeError('args[0] as kit', 'Kit');
    }

    const WorkflowKit = kit('Kitty<Workflow>');

    this[$I.KIT] = WorkflowKit;
    WorkflowKit[K_WORKFLOW] = $(this);
    Exchange.Configuration.install(WorkflowKit, $(this));
  }

  [$I.COMPOSE.PREPEND](...handler) {
    this[$I.WORKFLOW] = Composer.compose(...handler, this[$I.WORKFLOW]);
  }

  use(...handlerList) {
    this[$I.ASSERT.NOT_FINALIZED]();

    for (const index in handlerList) {
      assertHandlerByIndex(handlerList[index], index);
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
    DeploymentKit[K_DEPLOYMENT_SERVER] = server;

    return this[_I.COMPILE_ARTIFACT](DeploymentKit);
  }

  async [$I.DEPLOY](server, DeploymentKit) {
    if (this[$I.STATE].ReadableStreamDistributor === null) {
      Ow.Error.Common('It MUST set a readable stream distributor.');
    }

    const { link } = await this[$I.COMPILE](server, DeploymentKit);

    link();
  }

  async compile(server) {
    this[$I.ASSERT.FINALIZED]();

    const { listeners } = await this[$I.COMPILE](server);

    return listeners;
  }

  async deploy(server) {
    this[$I.ASSERT.FINALIZED]();

    return this[$I.DEPLOY](server);
  }

  async setReadableStreamDistributor(Constructor) {
    if (!isSubConstructor(Constructor, Fugue.Distributor)) {
      ThrowTypeError('args[0]', 'sub class of Fugue.Distributor');
    }

    this[$I.STATE].ReadableStreamDistributor = Constructor;

    return this;
  }
}

export default Abstract(
  KittyWorkflow,
  Abstract({
    [_I.COMPOSE.EXTEND]: M.Method(),
    [_I.COMPILE_ARTIFACT]: M.Method().returns(M.Object),
  }),
);
