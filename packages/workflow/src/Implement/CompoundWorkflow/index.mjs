import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract as CompoundWorkflowAbstract } from '../../CompoundWorkflow/index.mjs';
import * as COMPOUND_WORKFLOW from '../../CompoundWorkflow/_Symbol.mjs';
import Normalize from './Normalize.mjs';

export function CompoundWorkflow(_options) {
  const { normalizeHttpResponseBodyData } = Normalize(_options);

  class ImplWorkflow extends CompoundWorkflowAbstract {
    [COMPOUND_WORKFLOW._I.NORMALIZE_HTTP_RESPONSE_BODY_DATA](value) {
      return normalizeHttpResponseBodyData(value);
    }
  }

  return SCP(ImplWorkflow);
}
