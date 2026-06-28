import * as Ow from '@produck/ow';
import * as Kit from '@produck/kit';
import { ThrowTypeError } from '@produck/type-error';

import { I, $I, _I } from './Symbol.mjs';
import * as Exchange from './Exchange/index.mjs';
import AbstractKittyWorkflow, * as Abstract from './Abstract.mjs';
import * as Mixin from './Mixin.mjs';
import * as Adapter from './Adapter/index.mjs';

function ThrowAdapter(message, cause) {
  const throwArgs = [`Bad adapter: ${message}`];

  if (cause !== undefined) {
    throwArgs.push({ cause });
  }

  Ow.Error.Common(...throwArgs);
}

export class CompoundKittyWorkflow extends AbstractKittyWorkflow {
  [Mixin.I_HANDLER_LIST] = [];
  [Mixin.I_DEPLOYMENT_ATTACHER_LIST] = [];
  [Adapter.Artifact.I_EXCHANGE_ATTACHER_LIST] = [];

  constructor(...args) {
    super(...args);

    this[$I.KIT].appendDeploymentAttacher = (attacher) => {
      this[$I.ASSERT.NOT_FINALIZED]();

      if (typeof attacher !== 'function') {
        ThrowTypeError('args[0] as attacher', 'function');
      }

      this[Mixin.I_DEPLOYMENT_ATTACHER_LIST].push(attacher);
    };

    this[$I.KIT].appendExchangeAttacher = (attacher) => {
      this[$I.ASSERT.NOT_FINALIZED]();

      if (typeof attacher !== 'function') {
        ThrowTypeError('args[0] as attacher', 'function');
      }

      this[Adapter.Artifact.I_EXCHANGE_ATTACHER_LIST].push(attacher);
    };
  }

  [_I.COMPOSE.EXTEND]() {
    this[$I.COMPOSE.PREPEND](...Object.freeze(this[Mixin.I_HANDLER_LIST]));
  }

  [_I.COMPILE_ARTIFACT](DeploymentKit) {
    const injector = Kit.Injector(DeploymentKit);

    for (const attacher of this[Mixin.I_DEPLOYMENT_ATTACHER_LIST]) {
      injector.bind(attacher)();
    }

    const server = Abstract.useServer(DeploymentKit);
    const adapter = Adapter.Registry.getByServer(server);
    const handledExchanges = new WeakSet();
    const AdapterKit = DeploymentKit('Kitty<Adapter>');
    const artifact = Adapter.Artifact.installToAdapterKit(AdapterKit);

    AdapterKit.handleExchange = async function handleExchange(ExchangeKit) {
      try {
        void ExchangeKit[Abstract.K_DEPLOYMENT_SELF];
      } catch (cause) {
        ThrowAdapter('ExchangeKit not derived from DeploymentKit.', cause);
      }

      if (ExchangeKit === DeploymentKit) {
        ThrowAdapter('ExchangeKit MUST NOT be a DeploymentKit.');
      }

      const exchange = Exchange.touchExchange(ExchangeKit);

      if (exchange === undefined) {
        ThrowAdapter('Exchange is not installed.');
      }

      if (!(exchange instanceof Exchange.Abstract)) {
        ThrowAdapter('It MUST be an Exchange instance.');
      }

      if (exchange.server !== server) {
        ThrowAdapter('Bad linked server.');
      }

      if (handledExchanges.has(exchange)) {
        ThrowAdapter('Adapter dispatched one Exchange more than once.');
      }

      handledExchanges.add(exchange);

      const exInjector = Kit.Injector(ExchangeKit);

      for (const attacher of this[Adapter.Artifact.I_EXCHANGE_ATTACHER_LIST]) {
        exInjector.bind(attacher)();
      }

      await this[$I.WORKFLOW](ExchangeKit);
    };

    AdapterKit.attachDeployment = (name, value) => {
      if (!Kit.isDependenceName(name)) {
        ThrowTypeError('args[0] as dependency key', 'string | symbol');
      }

      DeploymentKit[name] = value;
    };

    adapter.install(AdapterKit);
    Adapter.Artifact.assertDeploymentArtifact(artifact);

    return artifact;
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

        const { listeners } = await this[I.COMPILE](server, DeploymentKit);

        return listeners;
      },
      deploy: async (server) => {
        consumeBy(deployer, server);

        const artifact = await this[I.COMPILE](server, DeploymentKit);
        const { link, listeners } = artifact;

        link(server, listeners);
      },
    });

    return deployer;
  }

  mixin() {
    const WorkflowKit = this[$I.KIT];
    const MixinKit = WorkflowKit('Kitty<Mixin>');

    MixinKit.attachWorkflow = (name, value) => {
      this[$I.ASSERT.NOT_FINALIZED]();

      if (!Kit.isDependenceName(name)) {
        ThrowTypeError('args[0] as dependency key', 'string | symbol');
      }

      WorkflowKit[name] = value;
    };

    void MixinKit;
  }
}

export { CompoundKittyWorkflow as Workflow };
