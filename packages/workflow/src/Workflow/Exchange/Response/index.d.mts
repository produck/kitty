import type * as Part from '../Part/index.d.mts';
import type * as Exchange from '../index.d.mts';
import type * as Header from './Header/index.d.mts';
import type * as _Symbol from './_Symbol.d.mts';

/** Response part: status and completion state. */
declare class Response<Internal = object> extends Part.Concrete<Internal> {
  /**
   * @param exchange - Exchange this part belongs to.
   */
  constructor(exchange: Exchange.Abstract<Internal>);

  /** Response header part. */
  readonly header: Header.Abstract<Internal>;

  /** Status code, within 100..599. */
  readonly statusCode: number;

  /** Reason phrase. */
  readonly statusText: string;

  /** Whether the response is finished (all writes done). */
  readonly isFinished: boolean;

  /**
   * Implementation: reads the status code.
   *
   * @param internal - Connection record supplied by the deployer.
   * @returns The status code.
   */
  [_Symbol._I.STATUS.GET](internal: Internal): number;

  /**
   * Implementation: reads the reason phrase.
   *
   * @param internal - Connection record supplied by the deployer.
   * @returns The reason phrase.
   */
  [_Symbol._I.STATUS_TEXT.GET](internal: Internal): string;

  /**
   * Implementation: reports whether the response is finished.
   *
   * @param internal - Connection record supplied by the deployer.
   * @returns `true` when every write is done.
   */
  [_Symbol._I.IS_FINISHED](internal: Internal): boolean;

  /** Implementation: constructor of the response header part. */
  static readonly [_Symbol._S.HEADER_CTOR]: abstract new (
    ...args: never[]
  ) => Header.Abstract;
}

export { Response as Abstract };
