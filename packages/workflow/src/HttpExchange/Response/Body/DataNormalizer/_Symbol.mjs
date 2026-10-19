import { deepFreeze } from '@produck/deep-freeze-enumerable';

const $I_TEST = Symbol('.$test()');
const $I_NORMALIZE = Symbol('.$normalize()');

export const $I = deepFreeze({
  TEST: $I_TEST,
  NORMALIZE: $I_NORMALIZE,
});

const _I_NORMALIZE = Symbol('._normalize()');

export const _I = deepFreeze({
  NORMALIZE: _I_NORMALIZE,
});

const _S_TEST = Symbol('._test()');

export const _S = deepFreeze({
  TEST: _S_TEST,
});
