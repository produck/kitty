import * as net from 'node:net';

import * as Ow from '@produck/ow';
import { ThrowTypeError } from '@produck/type-error';
import { isSubConstructor } from '@produck/is-sub-constructor';

const registry = new Map();
const instanceMap = new WeakMap();

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
    // Human-readable adapter label. May carry variant/modifier markers
    // for adapter composition scenarios.
    name: '',
    install: () => {},
  };

  if (isOptionsRecord(options)) {
    const {
      constructor: _constructor = net.Server,
      name: _name,
      install: _install,
    } = options;

    if (isSubConstructor(_constructor, net.Server)) {
      _options.constructor = _constructor;
    } else {
      ThrowTypeError('options.constructor', 'sub class of net.Server');
    }

    if (_name) {
      _options.name = _name;
    }

    if (typeof _install === 'function') {
      _options.install = _install;
    } else if (_install !== undefined) {
      ThrowTypeError('options.install', 'function');
    }
  } else {
    ThrowTypeError('options', 'plain object');
  }

  return _options;
}

function registerServerAdapter(options) {
  const { constructor, name, install } = normalizeOptions(options);

  if (registry.has(constructor)) {
    Ow.Error.Common(`Server constructor(${constructor.name}) exists.`);
  }

  registry.set(constructor, { name, install });
}

export function isAvaiableServer(value) {
  for (const constructor of registry.keys()) {
    if (value instanceof constructor) {
      return true;
    }
  }

  return false;
}

export function getByServer(server) {
  const fromInstance = instanceMap.get(server);

  if (fromInstance !== undefined) {
    return fromInstance;
  }

  const ServerConstructor = Object.getPrototypeOf(server).constructor;

  return registry.get(ServerConstructor);
}

export function associate(server, adapter) {
  instanceMap.set(server, adapter);
}

export { registerServerAdapter as register, normalizeOptions as define };
