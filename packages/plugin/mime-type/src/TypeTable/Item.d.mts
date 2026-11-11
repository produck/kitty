export declare interface Item {
  readonly mimeType: string;

  /**
   * Every other name the type answers to.
   *
   * An empty list means the type answers only to `mimeType`.
   */
  readonly aliasList: readonly string[];

  /**
   * Charset MIBenum values the type allows.
   *
   * An empty list means the type takes no `charset` parameter.
   */
  readonly charsetList: readonly number[];
}

export declare function isAlias(value: unknown): boolean;

export declare function isAliasList(value: unknown): boolean;

export declare function isMimeType(value: unknown): boolean;

export declare function isCharset(value: unknown): boolean;

export declare function copy(value: Item): Item;

export declare function normalizeItem(item: Item): Item;

export { normalizeItem as normalize };
