export class ExchangePipelineEvent extends CustomEvent {
  constructor(type, detail) {
    super(`exchange-pipeline-${type}`, { detail });
  }
}

export class DoneEvent extends ExchangePipelineEvent {
  constructor() {
    super('done');
  }
}

export class ErrorEvent extends ExchangePipelineEvent {
  constructor(error) {
    super('error', { error });
  }
}

export class FinishEvent extends ExchangePipelineEvent {
  constructor() {
    super('finish');
  }
}

export { DoneEvent as Done, ErrorEvent as Error, FinishEvent as Finish };
