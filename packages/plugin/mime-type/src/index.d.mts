import type * as Workflow from '@produck/kitty-workflow';

import type { Item } from './TypeTable/Item.d.mts';

export { useTypeTable } from './Capability.mjs';
export { Plugin } from './Plugin.mjs';

export declare function registerItem(
  workflow: Workflow.Abstract.Workflow,
  item: Item,
): Item;

export declare function registerItems(
  workflow: Workflow.Abstract.Workflow,
  itemList: readonly Item[],
): void;

export declare function deleteItem(
  workflow: Workflow.Abstract.Workflow,
  item: Item,
): void;

export declare function findAll(
  workflow: Workflow.Abstract.Workflow,
): readonly Item[];
