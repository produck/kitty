import type * as Workflow from '@produck/kitty-workflow';
import type { Record as CharsetRecord } from '@produck/kitty-charset';

import type { Input } from './Selector/Record.d.mts';

export { useCharset } from './Capability.mjs';
export { Plugin } from './Plugin.mjs';

declare const Record: Readonly<{
  /** Adds one charset record and returns its normalized copy. */
  register(workflow: Workflow.Abstract.Workflow, record: Input): CharsetRecord;
}>;

export { Record };
