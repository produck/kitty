import { Ow } from '@produck/argot';

const DEPLOYER_ERROR_PREFIX = '[DeployerImplementationError]';

export function ThrowDeployer(message, options) {
  Ow.Error.Common(`${DEPLOYER_ERROR_PREFIX} ${message}`, options);
}

// TODO dead
export function DeployerGuard({ message, member }) {
  const finalName = `deployer$${member.description}`;

  return {
    [finalName](target, ...args) {
      try {
        return target[member](...args);
      } catch (cause) {
        ThrowDeployer(message, { cause });
      }
    },
  }[finalName];
}
