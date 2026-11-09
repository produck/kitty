export { default as Selector } from './Selector/index.mjs';
export type { Record } from './Selector/index.d.mts';

/**
 * Symbol groups exposed per subject; only `_I` (instance abstract) is public.
 */
export declare const SYMBOL: Readonly<{
  /** Abstract slots of the selector. */
  SELECTOR: Readonly<{
    _I: typeof import('./Selector/_Symbol.d.mts')._I;
  }>;
}>;
