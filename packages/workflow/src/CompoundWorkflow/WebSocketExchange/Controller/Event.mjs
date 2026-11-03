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

class MessageEvent extends Event {
  #data;
  #isBinary;

  constructor(data, isBinary) {
    super(TYPE.MESSAGE);

    this.#data = data;
    this.#isBinary = isBinary;
  }

  get data() {
    return this.#data;
  }

  get isBinary() {
    return this.#isBinary;
  }
}

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

class ErrorEvent extends Event {
  #error;

  constructor(error) {
    super(TYPE.ERROR);

    this.#error = error;
  }

  get error() {
    return this.#error;
  }
}

export { MessageEvent as Message, CloseEvent as Close, ErrorEvent as Error };
