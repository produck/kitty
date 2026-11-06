declare class CookieParser {
  constructor(records: Iterable<CookieParser.Record>);

  readonly size: number;

  has(name: string): boolean;

  get(name: string): CookieParser.Record | undefined;

  keys(): IterableIterator<string>;

  values(): IterableIterator<CookieParser.Record>;

  entries(): IterableIterator<[string, CookieParser.Record]>;

  [Symbol.iterator](): IterableIterator<CookieParser.Record>;
}

declare namespace CookieParser {
  interface Record {
    readonly name: string;
    readonly value: string;
  }
}

export { CookieParser as Concrete };
