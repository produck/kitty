import { Use } from '@produck/kitty-workflow';

import * as Bridge from './Bridge.mjs';

export function useCharset(kit) {
  return Bridge.getSelector(Use.Workflow(kit));
}
