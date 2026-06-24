import * as Ow from '@produck/ow';
import * as Kit from '@produck/kit';
import { ThrowTypeError } from '@produck/type-error';

import { $I, _I } from './Symbol.mjs';
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

function buildDeploymentArtifact(workflow, DeploymentKit, adapter) {
  const server = Abstract.useServer(DeploymentKit);
  const handledExchanges = new WeakSet();
  const AdapterKit = DeploymentKit('Kitty<Adapter>');
  const artifact = Adapter.Artifact.installToAdapterKit(AdapterKit);

  Object.assign(AdapterKit, {
    handleExchange: async (ExchangeKit) => {
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

      await workflow[$I.WORKFLOW](ExchangeKit);
    },
    setDeploymentKit: (key, value) => {
      //TODO check key
      DeploymentKit[key] = value;
    },
  });

  adapter.install(AdapterKit);
  Adapter.Artifact.assertDeploymentArtifact(artifact);

  return artifact;
}

export class CompoundKittyWorkflow extends AbstractKittyWorkflow {
  [Mixin.I_HANDLER_LIST] = [];
  [Mixin.I_DEPLOYMENT_MODIFIER_LIST] = [];

  constructor(...args) {
    super(...args);
  }

  [_I.COMPOSE.EXTEND]() {
    this[$I.COMPOSE.PREFIX](...Object.freeze(this[Mixin.I_HANDLER_LIST]));
  }

  [_I.DEPLOY](DeploymentKit) {
    const injector = Kit.Injector(DeploymentKit);

    for (const modifier of this[Mixin.I_DEPLOYMENT_MODIFIER_LIST]) {
      injector.bind(modifier)();
    }
  }

  [_I.ADAPTER.COMPILE](DeploymentKit) {
    const server = Abstract.useServer(DeploymentKit);
    const adapter = Adapter.Registry.getByServer(server);

    //TODO assert install existed

    return buildDeploymentArtifact(this, DeploymentKit, adapter);
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
    }

    const compileArtifactOnce = (server, options) => {
      Abstract.initializeDeploymentKit(DeploymentKit, server, options);

      return buildDeploymentArtifact(this, DeploymentKit, finalAdapter);
    };

    const deployer = Object.freeze({
      compile: function compileOnce(server, ...args) {
        consumeBy(this, server);

        const { listeners } = compileArtifactOnce(server, ...args);

        return listeners;
      },
      deploy: function deployOnce(server, ...args) {
        consumeBy(this, server);

        const { listeners, link } = compileArtifactOnce(server, ...args);

        link(server, listeners);
      },
    });

    return deployer;
  }

  mixin() {
    const MixinKit = this[$I.KIT]('Kitty<Mixin>');

    void MixinKit;
  }
}

export { CompoundKittyWorkflow as Workflow };
