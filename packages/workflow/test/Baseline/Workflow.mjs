import * as Kit from '@produck/kit';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

import Distributor from './Distributor.mjs';

const DEFAULT_NORMALIZE = () => ({ stream: null, length: 0 });

export function createWorkflowClass(options = {}) {
  const { normalize = DEFAULT_NORMALIZE } = options;

  return class Workflow extends Abstract.Workflow {
    [SYMBOL.WORKFLOW._I.NORMALIZE_HTTP_RESPONSE_BODY_DATA](value) {
      return normalize(value);
    }
  };
}

export function createWorkflow(options = {}) {
  const Workflow = createWorkflowClass(options);
  const workflow = new Workflow(Kit.global);

  workflow.setRequestBodyDistributorConstructor(Distributor);

  return workflow;
}
