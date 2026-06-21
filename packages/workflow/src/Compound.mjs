import * as Ow from '@produck/ow';
import * as Kit from '@produck/kit';

import { $I, _I } from './Symbol.mjs';
import * as Exchange from './Exchange/index.mjs';
import AbstractKittyWorkflow, * as Abstract from './Abstract.mjs';
import * as Mixin from './Mixin.mjs';
import * as Adapter from './Adapter.mjs';

import * as WORKFLOW from './Symbol.mjs';

function ThrowBadAdapter(message, cause) {
  Ow.Error.Common(`Bad adapter: ${message}`, { cause });
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
    const adapt = Adapter.getByServer(server);

    //TODO assert adapt existed

    const AdapterKit = DeploymentKit('Kitty<Adapter>');
    const artifact = Adapter.installAdapterKitArtifact(AdapterKit);

    Object.assign(AdapterKit, {
      handleExchange: async (ExchangeKit) => {
        try {
          void ExchangeKit[Abstract.K_DEPLOYMENT_SELF];
        } catch (cause) {
          ThrowBadAdapter('ExchangeKit not derived from DeploymentKit.', cause);
        }

        if (ExchangeKit === DeploymentKit) {
          ThrowBadAdapter('ExchangeKit MUST NOT be a DeploymentKit.');
        }

        const exchange = Exchange.touchExchange(ExchangeKit);

        if (exchange === undefined) {
          ThrowBadAdapter('Exchange is not installed.');
        }

        if (!(exchange instanceof Exchange.Abstract)) {
          ThrowBadAdapter('It MUST be an Exchange instance.');
        }

        if (exchange.server !== server) {
          ThrowBadAdapter('Bad linked server.');
        }

        await this[WORKFLOW.$I.WORKFLOW](ExchangeKit);
      },
      setDeploymentKit: (key, value) => {
        DeploymentKit[key] = value;
      },
    });

    adapt(AdapterKit);

    return artifact;
  }
}

export { CompoundKittyWorkflow as Workflow };
