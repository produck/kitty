export declare interface Item {
  readonly alias: string;
  readonly mimeType: string;
}

export declare function isAlias(value: unknown): boolean;

export declare function isMimeType(value: unknown): boolean;

export declare function copy(value: Item): Item;

export declare function normalizeItem(item: Item): Item;

export { normalizeItem as normalize };
