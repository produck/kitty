import { Use } from '@produck/kitty-workflow';
import { useTypeTable } from '@produck/kitty-plugin-mime-type';

import * as ContentNegotiation from './ContentNegotiation/index.mjs';

export function useContentNegotiation(kit) {
  const exchange = Use.Exchange(kit);
  const typeTable = useTypeTable(kit);

  return new ContentNegotiation.Concrete(exchange, typeTable);
}
