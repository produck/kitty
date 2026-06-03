import * as Ow from '@produck/ow';
import { ThrowTypeError } from '@produck/type-error';
import * as Kit from '@produck/kit';
import * as Composer from '@produck/compose';

import * as Adapter from './Adapter.mjs';
import * as Transaction from './Transaction/index.mjs';

const I_CONSTRUCTOR = Symbol('#constructor');
const I_KIT = Symbol('#kit');
const I_WORKFLOW = Symbol('#workflow');
const I_HANDLER_SEQUENSE = Symbol('#handlerSequence');
const I_DEPLOY = Symbol('#deploy');

const K_DEPLOYMENT = Symbol('DeploymentKit.DEPLOYMENT');

export const { use: useDeployment } = Kit.Getter(K_DEPLOYMENT);

function ThrowBadAdapter(message, cause) {
  Ow.Error.Common(`Bad adapter: ${message}`, { cause });
}

export class KittyWorkflow {
  [I_WORKFLOW] = () => {};
  [I_HANDLER_SEQUENSE] = [];
  [I_CONSTRUCTOR] = KittyWorkflow;

  constructor(kit) {
    const WorkflowKit = kit('KitWorkflow');

    this[I_KIT] = WorkflowKit;
    this[I_CONSTRUCTOR] = new.target;
    Object.freeze(this);
  }

  install(installer) {
    if (typeof installer !== 'function') {
      ThrowTypeError('args[0] as installer', 'function');
    }
  }

  use(...handlerList) {
    if (this.isFinal) {
      Ow.throw('It has been finalized.');
    }

    for (const index in handlerList) {
      const handler = handlerList[index];

      if (typeof handler !== 'function' || handler.length > 2) {
        ThrowTypeError(`args[${index}] as handler`, '([kit[, next]]) => any');
      }
    }

    this[I_HANDLER_SEQUENSE].push(...handlerList);

    return this;
  }

  finalize() {
    if (this.isFinal) {
      Ow.throw('It has been finalized.');
    }

    const handlerSequense = this[I_HANDLER_SEQUENSE];

    this[I_WORKFLOW] = Composer.compose(...handlerSequense);
    Object.freeze(handlerSequense);

    return this;
  }

  get isFinal() {
    return this[I_WORKFLOW] !== null;
  }

  async [I_DEPLOY](install, server, options) {
    const DeploymentKit = this[I_KIT]('Kitty<Deployment>');
    const workflow = this[I_WORKFLOW];

    async function handleTransaction(TransactionKit) {
      if (TransactionKit === DeploymentKit) {
        ThrowBadAdapter('TransactionKit must not be DeploymentKit itself.');
      }

      try {
        useDeployment(TransactionKit);
      } catch (cause) {
        ThrowBadAdapter(
          'TransactionKit not derived from DeploymentKit.',
          cause,
        );
      }

      let transaction;

      try {
        transaction = Transaction.useTransaction(TransactionKit);
      } catch (cause) {
        ThrowBadAdapter('Transaction is not installed.', cause);
      }

      if (!(transaction instanceof Transaction.Abstract)) {
        ThrowBadAdapter('Transaction must be instanceof Abstract.');
      }

      await workflow(TransactionKit);
    }

    DeploymentKit[K_DEPLOYMENT] = Object.freeze({ server, options });
    await Kit.Injector(DeploymentKit).bind(install)(handleTransaction);

    return true;
  }

  async deploy(server, options) {
    if (!Adapter.isAvaiableServer(server)) {
      ThrowTypeError('args[0] as server', 'AvaiableHttpServer');
    }

    if (!this.isFinal) {
      Ow.throw('It MUST be finalized before deployment.');
    }

    const { install } = Adapter.getByServer(server);

    return this[I_DEPLOY](install, server, options);
  }

  adapt(options) {
    const { constructor, ...adapter } = Adapter.normalizeOptions(options);

    if (!this.isFinal) {
      Ow.throw('It must be finalized before adapt to deploy.');
    }

    let deployed = false,
      available = true;

    queueMicrotask(() => (available = false));

    return (server, options) => {
      if (!available) {
        Ow.Error.Common('It should be deployed immediately.');
      }

      if (deployed) {
        Ow.Error.Common('It has been deployed by a specific adapter.');
      }

      deployed = true;

      if (!(server instanceof constructor)) {
        ThrowTypeError('args[0] as server', adapter.name);
      }

      return this[I_DEPLOY](adapter.install, server, options);
    };
  }
}

export { KittyWorkflow as Generator };
