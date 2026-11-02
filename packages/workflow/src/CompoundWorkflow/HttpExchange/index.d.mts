import type * as Exchange from '../../Workflow/Exchange/index.d.mts';
import type * as ExchangeSymbol from '../../Workflow/Exchange/_Symbol.d.mts';
import type * as MutableResponse from '../../Workflow/Exchange/MutableResponse/index.d.mts';
import type * as _Symbol from './_Symbol.d.mts';

/** Response part port on the ExchangeKit. */
export declare const K_RESPONSE: unique symbol;

/** HTTP exchange: `mode` is always `'http'`. */
declare class HttpExchange<
  Internal = object,
> extends Exchange.Abstract<Internal> {
  /** Mutable response part. */
  readonly response: MutableResponse.Abstract<Internal>;

  /** Response status code. */
  readonly statusCode: number;

  /** Response reason phrase. */
  readonly statusText: string;

  /**
   * Writes the response status code and the optional reason phrase.
   *
   * @param code - Status code, within 100..599.
   * @param text - Reason phrase; keeps the current one when omitted.
   */
  setStatus(code: number, text?: string): void;

  /** Implementation: constructor of the mutable response part. */
  static readonly [_Symbol._S.RESPONSE_CTOR]: abstract new (
    ...args: never[]
  ) => MutableResponse.Abstract;

  /**
   * Implementation: the exchange mode is fixed to `'http'`.
   *
   * @param internal - Connection record supplied by the deployer.
   * @returns Always `'http'`.
   */
  [ExchangeSymbol._I.MODE](internal: Internal): 'http';
}

export { HttpExchange as Abstract };
