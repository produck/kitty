import { ThrowTypeError } from '@produck/type-error';

const NS = (name) => `KittyWorkflow.${name}`;
export const I_HANDLER_LIST = Symbol(NS('$handlerPrefixSequence'));
export const I_DEPLOYMENT_ATTACHER_LIST = Symbol(NS('$deploymentAttacherList'));

export function createMixinKit(WorkflowKit, workflow) {
  const MixinKit = WorkflowKit('Kitty<Mixin>');

  MixinKit.appendPrefixHandler = (...handlerList) => {
    for (const index in handlerList) {
      const handler = handlerList[index];

      if (typeof handler !== 'function' || handler.length > 2) {
        ThrowTypeError(`args[${index}] as handler`, '([kit[, next]]) => any');
      }
    }

    workflow[I_HANDLER_LIST].push(...handlerList);
  };
}

export { createMixinKit as createKit };
