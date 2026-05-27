import * as net from 'node:net';

import { isSubConstructor } from '@produck/is-sub-constructor';
import * as Ow from '@produck/ow';
import { ThrowTypeError } from '@produck/type-error';
import * as Kit from '@produck/kit';
import * as Composer from '@produck/compose';

const I_KIT = Symbol('#kit');
const I_CONSTRUCTOR = Symbol('#constructor');
const I_WORKFLOW = Symbol('#workflow');
const I_HANDLER_SEQUENSE = Symbol('#handlerSequence');
const S_DEPLOYMENT_ADAPTER_REGISTRY = Symbol('#deploymentAdapterRegistry');

class KittyGenerator {
  [I_KIT] = Kit.global;
  [I_WORKFLOW] = null;
  [I_HANDLER_SEQUENSE] = [];
  [I_CONSTRUCTOR] = KittyGenerator;

  constructor(kit) {
    this[I_KIT] = kit('KittyApplication');
    this[I_CONSTRUCTOR] = new.target;
    Object.freeze(this);
  }

  use(...handlerList) {
    for (const index in handlerList) {
      const handler = handlerList[index];

      if (typeof handler !== 'function' || handler.length > 2) {
        ThrowTypeError(`args[${index}] as handler`, '(kit?, next?) => any');
      }
    }

    this[I_HANDLER_SEQUENSE].push(...handlerList);

    return this;
  }

  async deploy(server) {
    if (!this[I_CONSTRUCTOR].isHttpServer(server)) {
      ThrowTypeError('args[0] as server', '<http | https | http2>.Server');
    }

    if (!this.isFinal) {
      Ow.throw('The KittyGenerator must be finalized before deployment.');
    }

    const TargetServer = Object.getPrototypeOf(server).constructor;
    const injector = Kit.Injector(this[I_KIT]('Kitty<Deployment>'));
    const registry = this[I_CONSTRUCTOR][S_DEPLOYMENT_ADAPTER_REGISTRY];
    const adapter = registry.get(TargetServer);

    await injector.bind(adapter.deploy)(server);

    return true;
  }

  finalize() {
    if (this.isFinal) {
      Ow.throw('The KittyGenerator MUST be finalized.');
    }

    const handlerSequense = this[I_HANDLER_SEQUENSE];

    this[I_WORKFLOW] = Composer.compose(...handlerSequense);
    Object.freeze(handlerSequense);

    return this;
  }

  get isFinal() {
    return this[I_WORKFLOW] !== null;
  }

  static [S_DEPLOYMENT_ADAPTER_REGISTRY] = new Map();

  static defineDeploymentAdapter(TargetServer, adapter) {
    if (!isSubConstructor(TargetServer, net.Server)) {
      ThrowTypeError('args[0] as TargetServer', 'sub net.Server');
    }

    if (typeof adapter !== 'function') {
      ThrowTypeError('args[1] as adapter', 'function');
    }

    this[S_DEPLOYMENT_ADAPTER_REGISTRY].set(TargetServer, adapter);
  }

  static isHttpServer(value) {
    for (const Server of this[S_DEPLOYMENT_ADAPTER_REGISTRY].keys()) {
      if (value instanceof Server) {
        return true;
      }
    }

    return false;
  }
}

export { KittyGenerator as Generator };
