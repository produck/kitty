import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_EXTRA_SINGLE_VALUED_SET = Symbol('.#extraSingleValuedSet');

const $I_ASSERT_APPENDABLE = Symbol('.$assertAppendable()');

export const I = deepFreeze({
  EXTRA_SINGLE_VALUED_SET: I_EXTRA_SINGLE_VALUED_SET,
});

export const $I = deepFreeze({
  ASSERT_APPENDABLE: $I_ASSERT_APPENDABLE,
});
