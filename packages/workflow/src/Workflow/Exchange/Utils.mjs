import { Ow } from '@produck/argot';

const DEPLOYER_ERROR_PREFIX = '[DeployerImplementationError]';

export function ThrowDeployer(message, options) {
  Ow.Error.Common(`${DEPLOYER_ERROR_PREFIX} ${message}`, options);
}
