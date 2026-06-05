import * as Kit from '@produck/kit';
import { ThrowTypeError } from '@produck/type-error';

export function PluginKit(WorkflowKit) {
  const preHandlers = [];
  let onDeployHook = () => {};
  const kit = WorkflowKit('Kitty<Plugin>');

  return {
    get kit() {
      return kit;
    },

    set(key, value) {
      WorkflowKit[key] = value;
    },

    set onDeploy(recipe) {
      if (typeof recipe === 'function') {
        onDeployHook = Kit.defineRecipe(recipe);
      } else {
        ThrowTypeError('args[0]', 'function');
      }
    },

    get onDeploy() {
      return onDeployHook;
    },

    use(handler) {
      if (typeof handler !== 'function' || handler.length > 2) {
        ThrowTypeError('args[0] as handler', '([kit[, next]]) => any');
      }

      preHandlers.push(handler);
    },

    get preHandlers() {
      return preHandlers;
    },
  };
}

export { PluginKit as Kit };
