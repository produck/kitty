import type * as Response from '../Response/index.d.mts';
import type * as MutableHeader from '../Response/MutableHeader/index.d.mts';
import type * as _Symbol from './_Symbol.d.mts';
import type * as ResponseSymbol from '../Response/_Symbol.d.mts';

/** Mutable response part: adds status writes to the read-only face. */
declare class MutableResponse<
  Internal = object,
> extends Response.Abstract<Internal> {
  /** Mutable response header part. */
  readonly header: MutableHeader.Abstract<Internal>;

  /**
   * Writes the status code; `text` keeps the current phrase when omitted.
   *
   * @param code - Status code, within 100..599.
   * @param text - Reason phrase; keeps the current one when omitted.
   */
  setStatus(code: number, text?: string): void;

  /**
   * Implementation: writes the status code.
   *
   * @param internal - Connection record supplied by the deployer.
   * @param code - Status code, within 100..599.
   */
  [_Symbol._I.STATUS.SET](internal: Internal, code: number): void;

  /**
   * Implementation: writes the reason phrase.
   *
   * @param internal - Connection record supplied by the deployer.
   * @param text - Reason phrase.
   */
  [_Symbol._I.STATUS_TEXT.SET](internal: Internal, text: string): void;

  /** Implementation: constructor of the mutable response header part. */
  static readonly [ResponseSymbol._S.HEADER_CTOR]: abstract new (
    ...args: never[]
  ) => MutableHeader.Abstract;
}

export { MutableResponse as Abstract };
