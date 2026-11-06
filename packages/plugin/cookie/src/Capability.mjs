import { useExchange } from '@produck/kitty-workflow';

import * as Bridge from './Bridge.mjs';

export function useCookie(kit) {
  const exchange = useExchange(kit);

  return Bridge.get(exchange);
}
