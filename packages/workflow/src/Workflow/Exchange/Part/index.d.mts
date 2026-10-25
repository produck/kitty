import type * as Workflow from '../../../CompoundWorkflow/index.d.mts';

import type * as Exchange from '../index.d.mts';

/** Common base of the exchange and its parts; exposes a read-only context. */
declare class ExchangePart<Internal = object> extends EventTarget {
  /**
   * @param exchange - Exchange this part belongs to.
   */
  constructor(exchange: Exchange.Abstract<Internal>);

  /** Owning exchange. */
  readonly exchange: Exchange.Abstract<Internal>;

  /** Owning workflow. */
  readonly workflow: Workflow.Abstract;
}

export { ExchangePart as Concrete };
