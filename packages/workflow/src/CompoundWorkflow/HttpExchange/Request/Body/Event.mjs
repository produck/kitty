export class HttpExchangeRequestBodyEvent extends CustomEvent {
  constructor(type, detail) {
    super(`http-request-body-data-${type}`, { detail });
  }
}

export class CloseEvent extends HttpExchangeRequestBodyEvent {
  constructor() {
    super('close');
  }
}

export class EndEvent extends HttpExchangeRequestBodyEvent {
  constructor() {
    super('end');
  }
}

export class ErrorEvent extends HttpExchangeRequestBodyEvent {
  constructor(error) {
    super('error', { error });
  }
}

export class LimitEvent extends HttpExchangeRequestBodyEvent {
  constructor(limit, consumed) {
    super('limit', { limit, consumed });
  }
}

export {
  CloseEvent as Close,
  EndEvent as End,
  ErrorEvent as Error,
  LimitEvent as Limit,
};
