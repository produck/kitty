import { Ow, ThrowTypeError } from '@produck/argot';
import * as Kit from '@produck/kit';
import { isSubConstructor } from '@produck/is-sub-constructor';
import Abstract, { Member as M, ShadowThis as $ } from '@produck/es-abstract';
import * as Composer from '@produck/compose';
import * as Fugue from '@produck/fugue';

import { I, $I, _I } from './_Symbol.mjs';
import * as Configuration from '../Configuration/index.mjs';
import * as DataNormalizerRegistry from './DataNormalizerRegistry/index.mjs';
import * as Deployment from './Deployment/index.mjs';
import { K_WORKFLOW } from '../Capability.mjs';
import { assertHandlerByIndex } from './Assert.mjs';

const DEFAULT_PASSTHROUGH = (_ctx, next) => next();

class Workflow {
  [I.HANDLER_LIST] = [];
  [$I.PIPELINE] = DEFAULT_PASSTHROUGH;

  [$I.STATE] = {
    RequestBodyDistributor: null,
    responseBodyNormalizerRegistry: null,
  };

  constructor(kit) {
    if (!Kit.isKit(kit)) {
      ThrowTypeError('args[0] as kit', 'Kit');
    }

    const WorkflowKit = kit('Kitty<Workflow>');

    this[$I.KIT] = WorkflowKit;
    WorkflowKit[K_WORKFLOW] = $(this);
    Configuration.install($(this));

    this[$I.STATE].responseBodyNormalizerRegistry =
      new DataNormalizerRegistry.Concrete();
  }

  [$I.COMPOSE.PREPEND](...handler) {
    this[$I.PIPELINE] = Composer.compose(...handler, this[$I.PIPELINE]);
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
    const deployment = new Deployment.Concrete(DeploymentKit, server, this);

    await this[_I.COMPILE_DEPLOYMENT](deployment);

    return deployment;
  }

  async [$I.DEPLOY](server, DeploymentKit) {
    if (this[$I.STATE].RequestBodyDistributor === null) {
      Ow.Error.Common('It MUST set a request body distributor.');
    }

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

  setRequestBodyDistributorConstructor(Constructor) {
    if (!isSubConstructor(Constructor, Fugue.Distributor)) {
      ThrowTypeError('args[0]', 'sub class of Fugue.Distributor');
    }

    this[$I.STATE].RequestBodyDistributor = Constructor;

    return this;
  }

  registerResponseBodyNormalizer(Normalizer) {
    this[$I.STATE].responseBodyNormalizerRegistry.register(Normalizer);

    return this;
  }
}

export default Abstract(
  Workflow,
  Abstract({
    [_I.COMPOSE.EXTEND]: M.Method(),
    [_I.COMPILE_DEPLOYMENT]: M.Method(),
  }),
);
