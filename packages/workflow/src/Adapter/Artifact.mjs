import { ThrowTypeError } from '@produck/type-error';
import { isPlainObject } from 'is-plain-object';

import E from './Error.mjs';

function isListenerRecord(value) {
  if (!isPlainObject(value)) {
    return false;
  }

  for (const eventName of Reflect.ownKeys(value)) {
    if (typeof value[eventName] !== 'function') {
      return false;
    }
  }

  return true;
}

export function isDeploymentArtifact(value) {
  if (!isPlainObject(value)) {
    return false;
  }

  if (typeof value.link !== 'function') {
    return false;
  }

  if (!isListenerRecord(value.listeners)) {
    return false;
  }

  return true;
}

export function assertDeploymentArtifact(value) {
  if (!isPlainObject(value)) {
    ThrowTypeError(E.M.ARTIFACT.SELF, E.R.ARTIFACT);
  }

  if (!isListenerRecord(value.listeners)) {
    ThrowTypeError(E.M.ARTIFACT.LISTENERS, E.R.LISTENERS);
  }

  if (typeof value.link !== 'function') {
    ThrowTypeError(E.M.ARTIFACT.LINK, E.R.LINK);
  }
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
