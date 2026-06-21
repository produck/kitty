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
    listeners: Kit.defineRecipe(() => ({})),
    install: () => {},
  };

  if (isPlainObject(options)) {
    const {
      constructor: _constructor,
      name: _name,
      listeners: _listeners,
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

    if (typeof _listeners === 'function') {
      _options.listeners = Kit.defineRecipe(_listeners);
    } else if (_listeners !== undefined) {
      ThrowTypeError('options.listeners', 'function');
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
  const { constructor, name, listeners, install } = normalizeOptions(options);

  if (registry.has(constructor)) {
    Ow.Error.Common(`Server constructor(${constructor.name}) exists.`);
  }

  registry.set(constructor, { name, listeners, install });
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

export function installAdapterKitArtifact(AdapterKit) {
  const artifact = {
    listeners: {},
    link: () => {},
  };

  AdapterKit.exportListener = function (eventName, listener) {
    artifact.listeners[eventName] = listener;
  };

  AdapterKit.setServerLinker = function (link) {
    artifact.link = link;
  };

  return artifact;
}

export { registerServerAdapter as register, normalizeOptions as define };
