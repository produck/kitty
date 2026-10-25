import type * as Part from '../Part/index.d.mts';
import type * as Exchange from '../index.d.mts';
import type * as Header from './Header/index.d.mts';
import type * as _Symbol from './_Symbol.d.mts';

/** Request part; `method` and `url` are implemented by the deployer. */
declare class Request<Internal = object> extends Part.Concrete<Internal> {
  /**
   * @param exchange - Exchange this part belongs to.
   */
  constructor(exchange: Exchange.Abstract<Internal>);

  /** Request header part. */
  readonly header: Header.Abstract<Internal>;

  /** Request method. */
  readonly method: string;

  /**
   * Request URL; a relative target is resolved with the host header and the
   * server protocol.
   */
  readonly url: URL;

  /**
   * Implementation: reads the request method.
   *
   * @param internal - Connection record supplied by the deployer.
   * @returns The request method.
   */
  [_Symbol._I.METHOD.GET](internal: Internal): string;

  /**
   * Implementation: reads the raw URL string.
   *
   * @param internal - Connection record supplied by the deployer.
   * @returns The raw URL string.
   */
  [_Symbol._I.URL.GET](internal: Internal): string;

  /** Implementation: constructor of the request header part. */
  static readonly [_Symbol._S.HEADER_CTOR]: abstract new (
    ...args: never[]
  ) => Header.Abstract;
}

export { Request as Abstract };
