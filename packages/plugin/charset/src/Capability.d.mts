import type * as Kit from '@produck/kit';

import type { Concrete as Selector } from './Selector/index.d.mts';

/**
 * Reads the charset selector installed on the workflow owning `kit`.
 *
 * @param kit
 * @returns The workflow level selector.
 */
export declare function useCharset(kit: Kit.KitProvider): Selector;
