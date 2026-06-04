import * as Kit from '@produck/kit';

const K_TRANSACTION = Symbol('KittyTransaction');

export const { use: useTransaction } = Kit.Getter(K_TRANSACTION);
export { default as Abstract } from './Abstract.mjs';
export { Implement } from './Implement.mjs';
