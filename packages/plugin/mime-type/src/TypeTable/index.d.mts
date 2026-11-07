import type * as Workflow from '@produck/kitty-workflow';

import type { Item } from './Item.d.mts';

declare class TypeTable {
  constructor(workflow: Workflow.Abstract.Workflow);

  findByAlias(alias: string): readonly Item[];

  findByMimeType(mimeType: string): readonly Item[];

  findAll(): readonly Item[];
}

export { TypeTable as Concrete };
export * as Item from './Item.mjs';
