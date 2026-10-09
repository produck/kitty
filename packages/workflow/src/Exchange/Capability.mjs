import * as Kit from '@produck/kit';

export const K_EXCHANGE = Symbol('KittyExchange');

export const { use: useExchange, touch: touchExchange } =
  Kit.Getter(K_EXCHANGE);
