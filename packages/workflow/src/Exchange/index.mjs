import * as Kit from '@produck/kit';

const K_EXCHANGE = Symbol('KittyExchange');

export const { use: useExchange, touch: touchExchange } =
  Kit.Getter(K_EXCHANGE);

export { default as Abstract } from './Abstract.mjs';
export { Implement } from './Implement.mjs';
export * as Configuration from './Config.mjs';
