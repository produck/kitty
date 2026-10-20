import { Ow, ThrowTypeError } from '@produck/argot';
import { deepFreeze } from '@produck/deep-freeze-enumerable';
import { compose } from '@produck/compose';

import * as Deployer from '../Deployer/index.mjs';
import * as Capability from '../Capability.mjs';
import * as Mixin from '../Mixin/index.mjs';
import * as Workflow from '../Workflow/index.mjs';

import * as Parser from './Parser.mjs';
import { I } from './_Symbol.mjs';
import { DEPLOYER, EXCHANGE, WORKFLOW } from './_Borrow.mjs';

export default class CompoundWorkflow extends Workflow.Abstract {
  [I.MIXIN.HANDLER.PREFIX.LIST] = [];
  [I.MIXIN.DEPLOYMENT.ATTACHER.LIST] = [];
  [I.MIXIN.EXCHANGE.ATTACHER.LIST] = [];

  [WORKFLOW._I.COMPOSE.EXTEND]() {
    Object.freeze(this[I.MIXIN.HANDLER.PREFIX.LIST]);
    this[WORKFLOW.$I.COMPOSE.PREPEND](...this[I.MIXIN.HANDLER.PREFIX.LIST]);
  }

  [WORKFLOW._I.COMPILE_ARTIFACT](DeploymentKit) {
    for (const attacher of this[I.MIXIN.DEPLOYMENT.ATTACHER.LIST]) {
      attacher(DeploymentKit);
    }

    const server = Capability.useServer(DeploymentKit);
    const TargetDeployer = Deployer.Registry.getByServer(server);
    const DeployerKit = DeploymentKit('Kitty<Deployer>');
    const deployer = new TargetDeployer(DeployerKit);
    const handledExchanges = new WeakSet();
    let compiled = false;

    DeployerKit.handleExchange = async (TargetExchange, internal) => {
      const ExchangeKit = DeploymentKit('Kitty<Exchange>');
      const exchange = new TargetExchange(ExchangeKit, internal);
      const identity = exchange[EXCHANGE.$I.IDENTITY];

      if (handledExchanges.has(identity)) {
        Deployer.Throw('Deployer dispatched one Exchange more than once.');
      }

      handledExchanges.add(identity);

      try {
        deployer[DEPLOYER.$I.ATTACH_EXCHANGE](ExchangeKit);

        for (const attacher of this[I.MIXIN.EXCHANGE.ATTACHER.LIST]) {
          attacher(ExchangeKit);
        }

        // IMPORTANT: the only call site of the handler pipeline, where the
        // business flow defined by downstream handlers runs.
        await this[WORKFLOW.$I.WORKFLOW](ExchangeKit);
      } finally {
        exchange.dispatchEvent(new Event('close'));
      }
    };

    DeployerKit.attachDeployment = (name, value) => {
      if (compiled) {
        Ow.Error.Common('Artifact has already been compiled.');
      }

      Parser.DependenceName(name);
      DeploymentKit[name] = value;
    };

    deployer[DEPLOYER.$I.INSTALL]();
    compiled = true;

    return deepFreeze({
      listeners: deployer[DEPLOYER.$I.LISTENERS],
      link: compose(...deployer[DEPLOYER.$I.LINK_LIST]),
    });
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

        const { listeners } = await this[WORKFLOW.$I.COMPILE](
          server,
          DeploymentKit,
        );

        return listeners;
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
      Parser.DependenceName(name);
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
}
