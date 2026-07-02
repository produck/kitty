import * as Ow from '@produck/ow';
import * as Kit from '@produck/kit';
import { ThrowTypeError } from '@produck/type-error';
import { deepFreeze } from '@produck/deep-freeze-enumerable';
import { compose } from '@produck/compose';

import * as Exchange from './Exchange/index.mjs';
import { $I, _I } from './Symbol.mjs';
import AbstractWorkflow, * as Abstract from './Abstract.mjs';
import * as Mixin from './Mixin/index.mjs';
import * as Adapter from './Adapter/index.mjs';

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

const I = deepFreeze({ MIXIN: Mixin.SYMBOL.WORKFLOW });

export class CompoundKittyWorkflow extends AbstractWorkflow {
  [I.MIXIN.HANDLER.PREFIX.LIST] = [];
  [I.MIXIN.DEPLOYMENT.ATTACHER.LIST] = [];
  [I.MIXIN.EXCHANGE.ATTACHER.LIST] = [];

  [_I.COMPOSE.EXTEND]() {
    const prefixHandlerList = this[I.MIXIN.HANDLER.PREFIX.LIST];

    this[$I.COMPOSE.PREPEND](...Object.freeze(prefixHandlerList));
  }

  [_I.COMPILE_ARTIFACT](DeploymentKit) {
    for (const attacher of this[I.MIXIN.DEPLOYMENT.ATTACHER.LIST]) {
      attacher(DeploymentKit);
    }

    let compiled = false;

    function assertNotCompiled() {
      if (compiled) {
        Ow.Error.Common('Artifact has already been compiled.');
      }
    }

    const server = Abstract.useServer(DeploymentKit);
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
        void ExchangeKit[Abstract.K_DEPLOYMENT_SELF];
      } catch (cause) {
        Adapter.Throw('ExchangeKit not derived from DeploymentKit.', cause);
      }

      if (ExchangeKit === DeploymentKit) {
        Adapter.Throw('ExchangeKit MUST NOT be a DeploymentKit.');
      }

      const exchange = Exchange.touchExchange(ExchangeKit);

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

      for (const attacher of [
        ...deploymentExchangeAttacherList,
        ...this[I.MIXIN.EXCHANGE.ATTACHER.LIST],
      ]) {
        attacher(ExchangeKit);
      }

      await this[$I.WORKFLOW](ExchangeKit);
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
    this[$I.ASSERT.FINALIZED]();

    const DeploymentKit = this[$I.KIT]('Kitty<Deployment:OneTime>');
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
      Adapter.Registry.installInstance(server, finalAdapter);
    }

    const deployer = Object.freeze({
      compile: async (server) => {
        consumeBy(deployer, server);

        const { listeners } = await this[$I.COMPILE](server, DeploymentKit);

        return listeners;
      },
      deploy: async (server) => {
        consumeBy(deployer, server);

        await this[$I.DEPLOY](server, DeploymentKit);
      },
    });

    return deployer;
  }

  mixin(installer) {
    const WorkflowKit = this[$I.KIT];
    const MixinKit = WorkflowKit('Kitty<Mixin>');

    Mixin.assertInstaller(installer);

    MixinKit.attachWorkflow = (name, value) => {
      this[$I.ASSERT.NOT_FINALIZED]();
      assertDependenceName(name);
      WorkflowKit[name] = value;
    };

    MixinKit.appendDeploymentAttacher = (attacher) => {
      this[$I.ASSERT.NOT_FINALIZED]();
      assertAttacher(attacher);
      this[I.MIXIN.DEPLOYMENT.ATTACHER.LIST].push(attacher);
    };

    MixinKit.appendExchangeAttacher = (attacher) => {
      this[$I.ASSERT.NOT_FINALIZED]();
      assertAttacher(attacher);
      this[I.MIXIN.EXCHANGE.ATTACHER.LIST].push(attacher);
    };

    MixinKit.appendPrefixHandler = (...handlerList) => {
      this[$I.ASSERT.NOT_FINALIZED]();

      for (const index in handlerList) {
        const handler = handlerList[index];

        Abstract.assertHandlerByIndex(handler, index);
      }

      this[I.MIXIN.HANDLER.PREFIX.LIST].push(...handlerList);
    };

    installer(MixinKit);
  }
}
