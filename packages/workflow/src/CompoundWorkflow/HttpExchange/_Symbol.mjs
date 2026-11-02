import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_START_TIMING = Symbol('.#startTiming()');
const I_RESPONSE = Symbol('.#response');

export const I = deepFreeze({
  START_TIMING: I_START_TIMING,
  RESPONSE: I_RESPONSE,
});

const _S_RESPONSE_CTOR = Symbol('._responseCtor');

export const _S = deepFreeze({
  RESPONSE_CTOR: _S_RESPONSE_CTOR,
});
