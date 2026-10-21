import { deepFreeze } from '@produck/deep-freeze-enumerable';

const I_CONTROLLER = Symbol('.#controller');

export const I = deepFreeze({
  CONTROLLER: I_CONTROLLER,
});

const _S_CONTROLLER_CTOR = Symbol('._controllerCtor');

export const _S = deepFreeze({
  CONTROLLER_CTOR: _S_CONTROLLER_CTOR,
});
