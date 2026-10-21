import { deepFreeze } from '@produck/deep-freeze-enumerable';

export const TYPE = deepFreeze({
  OPEN: 'open',
  MESSAGE: 'message',
  CLOSE: 'close',
  ERROR: 'error',
});

export const READY_STATE = deepFreeze({
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
});

class CloseEvent extends Event {
  #code;
  #reason;

  constructor(code, reason) {
    super(TYPE.CLOSE);

    this.#code = code;
    this.#reason = reason;
  }

  get code() {
    return this.#code;
  }

  get reason() {
    return this.#reason;
  }
}

export { CloseEvent as Close };
