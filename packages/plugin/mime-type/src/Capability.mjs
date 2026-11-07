import { Use } from '@produck/kitty-workflow';

import * as Bridge from './Bridge.mjs';

export function useTypeTable(kit) {
  return Bridge.getTypeTable(Use.Workflow(kit));
}
