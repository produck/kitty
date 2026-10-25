import type * as Part from '../../Part/index.d.mts';
import type * as Exchange from '../../index.d.mts';
import type * as _Symbol from './_Symbol.d.mts';

/** Request header part: read-only view; names are case-insensitive. */
declare class RequestHeader<Internal = object> extends Part.Concrete<Internal> {
  /**
   * @param exchange - Exchange this part belongs to.
   */
  constructor(exchange: Exchange.Abstract<Internal>);

  /**
   * Reads one header; returns `undefined` when absent.
   *
   * @param key - Header name, any casing.
   * @returns The header value, or `undefined` when absent.
   */
  get(key: string): string | undefined;

  /**
   * Reports whether the header exists.
   *
   * @param key - Header name, any casing.
   * @returns `true` when present.
   */
  has(key: string): boolean;

  /**
   * Lists every header name.
   *
   * @returns An iterable over header names.
   */
  keys(): Iterable<string>;

  /**
   * Yields `[name, value]` pairs one by one.
   *
   * @returns A generator of name / value pairs.
   */
  entries(): Generator<[string, string | undefined]>;

  /**
   * Implementation: reads one header.
   *
   * @param internal - Connection record supplied by the deployer.
   * @param key - Header name, any casing.
   * @returns The header value, or `undefined` when absent.
   */
  [_Symbol._I.GET](internal: Internal, key: string): string | undefined;

  /**
   * Implementation: lists every header name.
   *
   * @param internal - Connection record supplied by the deployer.
   * @returns An iterable over header names.
   */
  [_Symbol._I.KEYS](internal: Internal): Iterable<string>;
}

export { RequestHeader as Abstract };
