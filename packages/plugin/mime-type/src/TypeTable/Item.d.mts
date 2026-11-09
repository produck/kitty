export declare interface Item {
  readonly alias: string;
  readonly mimeType: string;

  /**
   * Charset MIBenum values the type allows.
   *
   * An empty list means the type takes no `charset` parameter.
   */
  readonly charsetList: readonly number[];
}

export declare function isAlias(value: unknown): boolean;

export declare function isMimeType(value: unknown): boolean;

export declare function isCharset(value: unknown): boolean;

export declare function copy(value: Item): Item;

export declare function normalizeItem(item: Item): Item;

export { normalizeItem as normalize };
