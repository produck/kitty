import { ThrowTypeError } from '@produck/type-error';

const NS = (name) => `KittyWorkflow.${name}`;
export const I_HANDLER_LIST = Symbol(NS('$handlerPrefixSequence'));
export const I_DEPLOYMENT_MODIFIER_LIST = Symbol(NS('$deploymentModifierList'));

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

  MixinKit.setWorkflowKit = (key, value) => {
    if (typeof key !== 'string' && typeof key !== 'symbol') {
      ThrowTypeError('args[0] as dependency key', 'string | symbol');
    }

    WorkflowKit[key] = value;
  };

  MixinKit.appendDeploymentKitModifier = (modifier) => {
    if (typeof modifier !== 'function') {
      ThrowTypeError('args[0] as modifier', 'function');
    }

    workflow[I_DEPLOYMENT_MODIFIER_LIST].push(modifier);
  };
}

export { createMixinKit as createKit };
