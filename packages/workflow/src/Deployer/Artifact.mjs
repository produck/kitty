import { isPlainObject } from 'is-plain-object';

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
