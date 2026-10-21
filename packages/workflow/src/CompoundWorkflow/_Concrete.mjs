import { Ow, ThrowTypeError } from '@produck/argot';
import { isSubConstructor } from '@produck/is-sub-constructor';
import * as Fugue from '@produck/fugue';

import * as Deployer from './Deployer/index.mjs';
import * as DataNormalizerRegistry from './DataNormalizerRegistry/index.mjs';
import * as Configuration from './Configuration/index.mjs';
import * as Mixin from './Mixin.mjs';
import * as Workflow from '../Workflow/index.mjs';

import * as Parser from './Parser.mjs';
import { DependenceName } from '../Parser.mjs';
import { useWorkflow } from '../Capability.mjs';
import { I, $I } from './_Symbol.mjs';
import { DEPLOYER, DEPLOYMENT, WORKFLOW } from './_Borrow.mjs';

export default class CompoundWorkflow extends Workflow.Abstract {
  [I.MIXIN.HANDLER.PREFIX.LIST] = [];
  [I.MIXIN.DEPLOYMENT.ATTACHER.LIST] = [];
  [I.MIXIN.EXCHANGE.ATTACHER.LIST] = [];

  [$I.STATE] = {
    RequestBodyDistributor: null,
    responseBodyNormalizerRegistry: new DataNormalizerRegistry.Concrete(),
  };

  constructor(...args) {
    super(...args);
    Configuration.install(useWorkflow(this[WORKFLOW.$I.KIT]));
  }

  [WORKFLOW._I.COMPOSE.EXTEND]() {
    Object.freeze(this[I.MIXIN.HANDLER.PREFIX.LIST]);
    this[WORKFLOW.$I.COMPOSE.PREPEND](...this[I.MIXIN.HANDLER.PREFIX.LIST]);
  }

  [WORKFLOW._I.COMPILE_DEPLOYMENT](deployment) {
    const DeploymentKit = deployment[DEPLOYMENT.$I.KIT];

    for (const attacher of this[I.MIXIN.DEPLOYMENT.ATTACHER.LIST]) {
      attacher(DeploymentKit);
    }

    const server = deployment[DEPLOYMENT.$I.SERVER];
    const DeployerClass = Deployer.Registry.getByServer(server);
    const DeployerKit = DeploymentKit('Kitty<Deployer>');
    const deployer = new DeployerClass(DeployerKit, deployment);

    deployer[DEPLOYER.$I.INSTALL]();

    for (const attacher of this[I.MIXIN.EXCHANGE.ATTACHER.LIST]) {
      deployment[DEPLOYMENT.$I.ADD_EXCHANGE_ATTACHER](attacher);
    }

    deployment[DEPLOYMENT.$I.COMMIT]();
  }

  async [WORKFLOW.$I.DEPLOY](server, DeploymentKit) {
    if (this[$I.STATE].RequestBodyDistributor === null) {
      Ow.Error.Common('It MUST set a request body distributor.');
    }

    return super[WORKFLOW.$I.DEPLOY](server, DeploymentKit);
  }

  adapt(DeployerClass) {
    this[WORKFLOW.$I.ASSERT.FINALIZED]();

    const DeploymentKit = this[WORKFLOW.$I.KIT]('Kitty<Deployment:OneTime>');

    Deployer.Registry.assertDeployer(DeployerClass);

    const Server = DeployerClass[DEPLOYER._S.SERVER_CTOR];
    let expired = false;
    let consumed = false;

    queueMicrotask(() => (expired = true));

    function consumeBy(context, server) {
      if (context !== deployer) {
        Ow.Error.Common('Must consume through its deployer.');
      }

      if (!(server instanceof Server)) {
        ThrowTypeError('args[0] as server', Server.name);
      }

      if (consumed) {
        Ow.Error.Common('One-time deployer has already been used.');
      }

      if (expired) {
        Ow.Error.Common('One-time deployer MUST be consumed immediately.');
      }

      consumed = true;
      Deployer.Registry.associate(server, DeployerClass);
    }

    const deployer = Object.freeze({
      compile: async (server) => {
        consumeBy(deployer, server);

        const deployment = await this[WORKFLOW.$I.COMPILE](
          server,
          DeploymentKit,
        );

        return deployment.listeners;
      },
      deploy: async (server) => {
        consumeBy(deployer, server);
        await this[WORKFLOW.$I.DEPLOY](server, DeploymentKit);
      },
    });

    return deployer;
  }

  mixin(installer) {
    const WorkflowKit = this[WORKFLOW.$I.KIT];
    const MixinKit = WorkflowKit('Kitty<Mixin>');

    Mixin.assertInstaller(installer);

    MixinKit.attachWorkflow = (name, value) => {
      this[WORKFLOW.$I.ASSERT.NOT_FINALIZED]();
      DependenceName(name);
      WorkflowKit[name] = value;
    };

    MixinKit.appendDeploymentAttacher = (attacher) => {
      this[WORKFLOW.$I.ASSERT.NOT_FINALIZED]();
      Parser.Attacher(attacher);
      this[I.MIXIN.DEPLOYMENT.ATTACHER.LIST].push(attacher);
    };

    MixinKit.appendExchangeAttacher = (attacher) => {
      this[WORKFLOW.$I.ASSERT.NOT_FINALIZED]();
      Parser.Attacher(attacher);
      this[I.MIXIN.EXCHANGE.ATTACHER.LIST].push(attacher);
    };

    MixinKit.appendPrefixHandler = (...handlerList) => {
      this[WORKFLOW.$I.ASSERT.NOT_FINALIZED]();

      for (const index in handlerList) {
        const handler = handlerList[index];

        Workflow.Assert.assertHandlerByIndex(handler, index);
      }

      this[I.MIXIN.HANDLER.PREFIX.LIST].push(...handlerList);
    };

    installer(MixinKit);
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
