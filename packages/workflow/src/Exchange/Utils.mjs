import * as Ow from '@produck/ow';

const ADAPTER_ERROR_PREFIX = '[AdapterImplementationError]';

export function ThrowAdapter(message, options) {
  Ow.Error.Common(`${ADAPTER_ERROR_PREFIX} ${message}`, options);
}

export function AssertAdapterNotThrow(message, fn) {
  try {
    return fn();
  } catch (cause) {
    ThrowAdapter(message, { cause });
  }
}
