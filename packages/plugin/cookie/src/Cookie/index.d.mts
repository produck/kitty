import type { Concrete as CookieParser } from '../CookieParser/index.d.mts';

declare class Cookie {
  readonly size: number;

  has(name: string): boolean;

  get(name: string): CookieParser.Record | undefined;

  keys(): IterableIterator<string>;

  values(): IterableIterator<CookieParser.Record>;

  entries(): IterableIterator<[string, CookieParser.Record]>;

  [Symbol.iterator](): IterableIterator<CookieParser.Record>;

  set(name: string, value: string, options?: Cookie.Options): void;
}

declare namespace Cookie {
  interface Options {
    path?: string;
    domain?: string;
    maxAge?: number;
    expires?: Date;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  }
}

export { Cookie as Abstract };
export { _I } from './_Symbol.d.mts';
