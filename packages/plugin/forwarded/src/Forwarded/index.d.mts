import type { Abstract as Workflow } from '@produck/kitty-workflow';

declare interface Entry {
  for?: string;
  by?: string;
  host?: string;
  proto?: string;
}

declare class Forwarded {
  constructor(exchange: Workflow.Exchange, trustedList: readonly string[]);

  readonly entryList: () => Entry[];
  readonly client: () => string | null;
  readonly protocol: () => string | null;
}

export { Entry, Forwarded as Concrete };
