import type * as Workflow from '@produck/kitty-workflow';
import type { Selector } from '@produck/kitty-charset';

declare class Concrete extends Selector {
  constructor(workflow: Workflow.Abstract.Workflow);
}

export { Concrete as default };
export { Concrete };
