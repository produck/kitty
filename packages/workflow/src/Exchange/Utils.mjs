import * as Ow from '@produck/ow';

const ADAPTER_ERROR_PREFIX = '[AdapterImplementationError]';

export function ThrowAdapter(message, options) {
  Ow.Error.Common(`${ADAPTER_ERROR_PREFIX} ${message}`, options);
}

export function AdapterGuard({ message, member }) {
  const finalName = `adapter$${member.description}`;

  return {
    [finalName](target, ...args) {
      try {
        return target[member](...args);
      } catch (cause) {
        ThrowAdapter(message, { cause });
      }
    },
  }[finalName];
}
