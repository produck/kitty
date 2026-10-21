import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_BODY = Symbol('.#body');

export const I = deepFreeze({
  BODY: I_BODY,
});

const _S_BODY_CTOR = Symbol('._bodyCtor');

export const _S = deepFreeze({
  BODY_CTOR: _S_BODY_CTOR,
});
