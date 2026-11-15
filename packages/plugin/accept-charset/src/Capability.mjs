import { Use } from '@produck/kitty-workflow';
import { useCharset } from '@produck/kitty-plugin-charset';

import * as AcceptCharset from './AcceptCharset/index.mjs';

export function useAcceptCharset(kit) {
  const exchange = Use.Exchange(kit);
  const charset = useCharset(kit);

  return new AcceptCharset.Concrete(exchange, charset);
}
