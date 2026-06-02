import * as Ow from '@produck/ow';
import { ThrowTypeError } from '@produck/type-error';
import * as Kit from '@produck/kit';
import * as Composer from '@produck/compose';

import * as Adapter from './Adapter.mjs';

const I_KIT = Symbol('#kit');
const I_INJECTOR = Symbol('#injector');
const I_CONSTRUCTOR = Symbol('#constructor');
const I_WORKFLOW = Symbol('#workflow');
const I_HANDLER_SEQUENSE = Symbol('#handlerSequence');

async function deploy(kit, install, server, options) {
  const DeploymentKit = kit('Kitty<Deployment>');

  await Kit.Injector(DeploymentKit).bind(install)(server, options);

  return true;
}

export class KittyWorkflow {
  [I_WORKFLOW] = null;
  [I_HANDLER_SEQUENSE] = [];
  [I_CONSTRUCTOR] = KittyWorkflow;

  constructor(kit) {
    const WorkflowKit = kit('KitWorkflow');

    this[I_KIT] = WorkflowKit;
    this[I_INJECTOR] = Kit.Injector(WorkflowKit);
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

  async deploy(server, options) {
    if (!Adapter.isAvaiableHttpServer(server)) {
      ThrowTypeError('args[0] as server', 'AvaiableHttpServer');
    }

    if (!this.isFinal) {
      Ow.throw('It MUST be finalized before deployment.');
    }

    const { install } = Adapter.getByServer(server);

    return deploy(this[I_KIT], install, server, options);
  }

  adapt(options) {
    const { constructor, ...adapter } = Adapter.normalizeOptions(options);

    if (!this.isFinal) {
      Ow.throw('It must be finalized before adapt to deploy.');
    }

    let deployed = false,
      available = true;

    queueMicrotask(() => (available = false));

    return function deployOnce(server, options) {
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

      return deploy(this[I_KIT], adapter.install, server, options);
    };
  }
}

export { KittyWorkflow as Generator };
