export class HttpExchangeEvent extends CustomEvent {
  constructor(type, detail) {
    super(type, { detail });
  }
}

export class TimeoutEvent extends HttpExchangeEvent {
  constructor(timeout) {
    super('http-exchange-timeout', { timeout });
  }
}

export { TimeoutEvent as Timeout };
