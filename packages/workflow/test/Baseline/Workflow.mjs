import * as Kit from '@produck/kit';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

import Distributor from './Distributor.mjs';

const DEFAULT_NORMALIZE = () => ({ stream: null, length: 0 });

export function createWorkflowClass(options = {}) {
  const {
    base = Abstract.Workflow,
    normalize = DEFAULT_NORMALIZE,
    deployers = [],
    specification = undefined,
  } = options;

  const Workflow = class extends base {
    [SYMBOL.WORKFLOW._I.NORMALIZE_HTTP_RESPONSE_BODY_DATA](value) {
      return normalize(value);
    }
  };

  if (specification !== undefined) {
    Object.defineProperty(Workflow, 'HeaderSpecification', {
      value: specification,
    });
  }

  for (const Deployer of deployers) {
    Workflow.DeployerRegistry.register(Deployer);
  }

  return Workflow;
}

export function createWorkflow(options = {}) {
  const Workflow = createWorkflowClass(options);
  const workflow = new Workflow(Kit.global);
  workflow.setRequestBodyDistributorConstructor(Distributor);

  return workflow;
}
