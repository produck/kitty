import { Use } from '@produck/kitty-workflow';
import { useTypeTable } from '@produck/kitty-plugin-mime-type';
import { useCharset } from '@produck/kitty-plugin-charset';

import * as ResponseContentTypeAccessor from './ResponseContentTypeAccessor/index.mjs';

export function useResponseContentTypeAccessor(kit) {
  const exchange = Use.Exchange(kit);
  const typeTable = useTypeTable(kit);
  const charset = useCharset(kit);

  return new ResponseContentTypeAccessor.Concrete(exchange, typeTable, charset);
}

export { useResponseContentTypeAccessor as useResponseType };
