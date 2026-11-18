import * as Kit from '@produck/kit';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

import Distributor from './Distributor.mjs';

const DEFAULT_NORMALIZE = () => ({ stream: null, length: 0 });

export function createWorkflowClass(options = {}) {
  const {
    base = Abstract.Workflow,
    normalize = DEFAULT_NORMALIZE,
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

  return Workflow;
}

export function createWorkflow(options = {}) {
  const { deployers = [], ...rest } = options;
  const Workflow = createWorkflowClass(rest);
  const workflow = new Workflow(Kit.global);

  workflow.setRequestBodyDistributorConstructor(Distributor);

  for (const Deployer of deployers) {
    workflow.mountDeployer(Deployer);
  }

  return workflow;
}
