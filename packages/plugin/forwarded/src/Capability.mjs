import { Use } from '@produck/kitty-workflow';

import * as Forwarded from './Forwarded/index.mjs';

export function useForwarded(kit) {
  const exchange = Use.Exchange(kit);

  return new Forwarded.Concrete(exchange);
}
