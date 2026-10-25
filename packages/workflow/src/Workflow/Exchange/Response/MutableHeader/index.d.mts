import type * as Header from '../Header/index.d.mts';
import type * as _Symbol from './_Symbol.d.mts';

/** Writable response header part; validates name and value before writing. */
declare class MutableResponseHeader<
  Internal = object,
> extends Header.Abstract<Internal> {
  /**
   * Sets a header, overwriting any existing value.
   *
   * @param key - Header name; must be a valid token.
   * @param value - Header value; must be free of control characters.
   */
  set(key: string, value: string): void;

  /**
   * Removes a header.
   *
   * @param key - Header name, any casing.
   */
  delete(key: string): void;

  /** Removes every header. */
  clear(): void;

  /**
   * Implementation: writes one header.
   *
   * @param internal - Connection record supplied by the deployer.
   * @param key - Header name.
   * @param value - Header value.
   */
  [_Symbol._I.SET](internal: Internal, key: string, value: string): void;

  /**
   * Implementation: removes one header.
   *
   * @param internal - Connection record supplied by the deployer.
   * @param key - Header name, any casing.
   */
  [_Symbol._I.DELETE](internal: Internal, key: string): void;
}

export { MutableResponseHeader as Abstract };
