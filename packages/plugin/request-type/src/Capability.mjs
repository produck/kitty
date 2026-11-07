import { Use } from '@produck/kitty-workflow';
import { useTypeTable } from '@produck/kitty-plugin-mime-type';

import * as RequestContentTypeAccessor from './RequestContentTypeAccessor/index.mjs';

export function useRequestContentTypeAccessor(kit) {
  const exchange = Use.Exchange(kit);
  const typeTable = useTypeTable(kit);

  return new RequestContentTypeAccessor.Concrete(exchange, typeTable);
}

export { useRequestContentTypeAccessor as useRequestType };
