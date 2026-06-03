import * as net from 'node:net';

import * as Ow from '@produck/ow';
import { ThrowTypeError } from '@produck/type-error';
import { isPlainObject } from 'is-plain-object';
import { isSubConstructor } from '@produck/is-sub-constructor';
import * as Kit from '@produck/kit';

const registry = new Map();

export function normalizeOptions(options) {
  const _options = {
    constructor: net.Server,
    name: '',
    // install: async (kit, [server, options]) => {},
    options: () => {},
  };

  if (isPlainObject(options)) {
    const {
      constructor: _constructor,
      name: _name,
      install: _install,
    } = options;

    if (!isSubConstructor(options.constructor, net.Server)) {
      _options.constructor = _constructor;
    } else {
      ThrowTypeError('args[0] as TargetServer', 'sub net.Server');
    }

    if (typeof _install !== 'function') {
      _options.install = Kit.defineRecipe(_install);
    } else {
      ThrowTypeError('args[1] as adapter', 'function');
    }
  } else {
    ThrowTypeError('args[0] as options', 'plain object');
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
