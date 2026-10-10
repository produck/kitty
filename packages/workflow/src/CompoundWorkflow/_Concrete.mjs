import { Ow, ThrowTypeError } from '@produck/argot';
import * as Kit from '@produck/kit';
import { deepFreeze } from '@produck/deep-freeze-enumerable';
import { compose } from '@produck/compose';

import * as Exchange from '../Exchange/index.mjs';
import { touchExchange } from '../Exchange/Capability.mjs';
import * as Adapter from '../Adapter/index.mjs';
import * as Mixin from '../Mixin/index.mjs';
import * as Workflow from '../Workflow/index.mjs';
import { assertHandlerByIndex } from '../Workflow/Assert.mjs';
import { K_DEPLOYMENT_SELF, useServer } from '../Workflow/Capability.mjs';
import { I } from './_Symbol.mjs';
import { WORKFLOW } from './_Borrow.mjs';

function assertAttacher(value) {
  if (typeof value !== 'function') {
    ThrowTypeError('args[0] as attacher', 'function');
  }
}

function assertDependenceName(value) {
  if (!Kit.isDependenceName(value)) {
    ThrowTypeError('args[0] as dependency name', 'string | symbol');
  }
}

export default class CompoundKittyWorkflow extends Workflow.Abstract {
  [I.MIXIN.HANDLER.PREFIX.LIST] = [];
  [I.MIXIN.DEPLOYMENT.ATTACHER.LIST] = [];
  [I.MIXIN.EXCHANGE.ATTACHER.LIST] = [];

  [WORKFLOW._I.COMPOSE.EXTEND]() {
    const prefixHandlerList = this[I.MIXIN.HANDLER.PREFIX.LIST];

    this[WORKFLOW.$I.COMPOSE.PREPEND](...Object.freeze(prefixHandlerList));
  }

  [WORKFLOW._I.COMPILE_ARTIFACT](DeploymentKit) {
    for (const attacher of this[I.MIXIN.DEPLOYMENT.ATTACHER.LIST]) {
      attacher(DeploymentKit);
    }

    let compiled = false;

    function assertNotCompiled() {
      if (compiled) {
        Ow.Error.Common('Artifact has already been compiled.');
      }
    }

    const server = useServer(DeploymentKit);
    const adapter = Adapter.Registry.getByServer(server);
    const handledExchanges = new WeakSet();
    const AdapterKit = DeploymentKit('Kitty<Adapter>');
    const listeners = {};
    const linkList = [];
    const deploymentExchangeAttacherList = [];

    AdapterKit.exportListener = function (eventName, listener) {
      assertNotCompiled();

      if (typeof eventName !== 'string') {
        ThrowTypeError('args[0] as eventName', 'string');
      }

      if (typeof listener !== 'function') {
        ThrowTypeError('args[1] as listener', 'function');
      }

      listeners[eventName] = listener;
    };

    AdapterKit.setServerLinker = function (link) {
      assertNotCompiled();

      if (typeof link !== 'function') {
        ThrowTypeError('args[0] as linker', 'function');
      }

      linkList.unshift(link);
    };

    AdapterKit.handleExchange = async function handleExchange(ExchangeKit) {
      try {
        void ExchangeKit[K_DEPLOYMENT_SELF];
      } catch (cause) {
        Adapter.Throw('ExchangeKit not derived from DeploymentKit.', cause);
      }

      if (ExchangeKit === DeploymentKit) {
        Adapter.Throw('ExchangeKit MUST NOT be a DeploymentKit.');
      }

      const exchange = touchExchange(ExchangeKit);

      if (exchange === undefined) {
        Adapter.Throw('Exchange is not installed.');
      }

      if (!(exchange instanceof Exchange.Abstract)) {
        Adapter.Throw('It MUST be an Exchange instance.');
      }

      if (exchange.server !== server) {
        Adapter.Throw('Bad linked server.');
      }

      if (handledExchanges.has(exchange)) {
        Adapter.Throw('Adapter dispatched one Exchange more than once.');
      }

      handledExchanges.add(exchange);

      try {
        for (const attacher of [
          ...deploymentExchangeAttacherList,
          ...this[I.MIXIN.EXCHANGE.ATTACHER.LIST],
        ]) {
          attacher(ExchangeKit);
        }

        await this[WORKFLOW.$I.WORKFLOW](ExchangeKit);
      } finally {
        exchange.dispatchEvent(new Event('close'));
      }
    };

    AdapterKit.attachDeployment = (name, value) => {
      assertNotCompiled();
      assertDependenceName(name);
      DeploymentKit[name] = value;
    };

    AdapterKit.appendExchangeAttacher = (attacher) => {
      assertNotCompiled();
      assertAttacher(attacher);
      deploymentExchangeAttacherList.push(attacher);
    };

    adapter.install(AdapterKit);
    compiled = true;

    return deepFreeze({
      listeners,
      link: compose(...linkList),
    });
  }

  adapt(adapter) {
    this[WORKFLOW.$I.ASSERT.FINALIZED]();

    const DeploymentKit = this[WORKFLOW.$I.KIT]('Kitty<Deployment:OneTime>');
    const finalAdapter = Adapter.Registry.normalizeOptions(adapter);
    let expired = false;
    let consumed = false;

    queueMicrotask(() => (expired = true));

    function consumeBy(context, server) {
      if (context !== deployer) {
        Ow.Error.Common('Must consume through its deployer.');
      }

      if (!(server instanceof finalAdapter.constructor)) {
        ThrowTypeError('args[0] as server', finalAdapter.constructor.name);
      }

      if (consumed) {
        Ow.Error.Common('One-time deployment adapter has already been used.');
      }

      if (expired) {
        Ow.Error.Common(
          'One-time deployment adapter MUST be consumed immediately.',
        );
      }

      consumed = true;
      Adapter.Registry.associate(server, finalAdapter);
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
      assertDependenceName(name);
      WorkflowKit[name] = value;
    };

    MixinKit.appendDeploymentAttacher = (attacher) => {
      this[WORKFLOW.$I.ASSERT.NOT_FINALIZED]();
      assertAttacher(attacher);
      this[I.MIXIN.DEPLOYMENT.ATTACHER.LIST].push(attacher);
    };

    MixinKit.appendExchangeAttacher = (attacher) => {
      this[WORKFLOW.$I.ASSERT.NOT_FINALIZED]();
      assertAttacher(attacher);
      this[I.MIXIN.EXCHANGE.ATTACHER.LIST].push(attacher);
    };

    MixinKit.appendPrefixHandler = (...handlerList) => {
      this[WORKFLOW.$I.ASSERT.NOT_FINALIZED]();

      for (const index in handlerList) {
        const handler = handlerList[index];

        assertHandlerByIndex(handler, index);
      }

      this[I.MIXIN.HANDLER.PREFIX.LIST].push(...handlerList);
    };

    installer(MixinKit);
  }
}
