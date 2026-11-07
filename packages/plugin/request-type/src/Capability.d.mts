import type * as Kit from '@produck/kit';

import type * as RequestContentTypeAccessor from './RequestContentTypeAccessor/index.d.mts';

export declare function useRequestContentTypeAccessor(
  kit: Kit.KitProvider,
): RequestContentTypeAccessor.Concrete;
