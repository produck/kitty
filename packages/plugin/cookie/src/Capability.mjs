import { Use } from '@produck/kitty-workflow';

import * as Bridge from './Bridge.mjs';

export function useCookie(kit) {
  return Bridge.getCookie(Use.Exchange(kit));
}
