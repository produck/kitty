import { deepFreeze } from '@produck/deep-freeze-enumerable';

import * as DEPLOYER_REGISTRY from './DeployerRegistry/_Symbol.mjs';

export * as DEPLOYER from './Deployer/_Symbol.mjs';
export * as DEPLOYMENT from '../Workflow/Deployment/_Symbol.mjs';
export * as PLUGIN from './Plugin/_Symbol.mjs';
export * as WORKFLOW from '../Workflow/_Symbol.mjs';

export { DEPLOYER_REGISTRY };
export const _A = deepFreeze({ REGISTRY: DEPLOYER_REGISTRY });
