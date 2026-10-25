import type * as Exchange from '../../Workflow/Exchange/index.d.mts';
import type * as ExchangeSymbol from '../../Workflow/Exchange/_Symbol.d.mts';

/** HTTP exchange: `mode` is always `'http'`. */
declare class HttpExchange<
  Internal = object,
> extends Exchange.Abstract<Internal> {
  /**
   * Implementation: the exchange mode is fixed to `'http'`.
   *
   * @param internal - Connection record supplied by the deployer.
   * @returns Always `'http'`.
   */
  [ExchangeSymbol._I.MODE](internal: Internal): 'http';
}

export { HttpExchange as Abstract };
