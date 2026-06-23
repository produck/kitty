import * as net from 'node:net';

import * as Ow from '@produck/ow';
import { ThrowTypeError } from '@produck/type-error';
import { isSubConstructor } from '@produck/is-sub-constructor';

const registry = new Map();

function isOptionsRecord(value) {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === null || prototype === Object.prototype;
}

export function normalizeOptions(options) {
  const _options = {
    constructor: net.Server,
    //TODO redesign adapter identity surface; legacy name metadata is too weak for
    //protocol-level invariants such as logical exchange identity.
    name: '',
    adapt: () => {},
  };

  if (isOptionsRecord(options)) {
    const {
      constructor: _constructor = net.Server,
      name: _name,
      adapt: _adapt,
    } = options;

    if (isSubConstructor(_constructor, net.Server)) {
      _options.constructor = _constructor;
    } else {
      ThrowTypeError('options.constructor', 'sub class of net.Server');
    }

    if (_name) {
      _options.name = _name;
    }

    if (typeof _adapt === 'function') {
      _options.adapt = _adapt;
    } else if (_adapt !== undefined) {
      ThrowTypeError('options.adapt', 'function');
    }
  } else {
    ThrowTypeError('options', 'plain object');
  }

  return _options;
}

function registerServerAdapter(options) {
  const { constructor, adapt } = normalizeOptions(options);

  if (registry.has(constructor)) {
    Ow.Error.Common(`Server constructor(${constructor.name}) exists.`);
  }

  registry.set(constructor, adapt);
}

export function isAvaiableServer(value) {
  for (const Server of registry.keys()) {
    if (value instanceof Server) {
      return true;
    }
  }

  return false;
}

export function getByServer(server) {
  const { constructor } = Object.getPrototypeOf(server);
  const adapter = registry.get(constructor);

  return adapter;
}

export { registerServerAdapter as register, normalizeOptions as define };
