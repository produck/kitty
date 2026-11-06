import type { Abstract as Workflow } from '@produck/kitty-workflow';

import type { Abstract as Cookie } from '../Cookie/index.d.mts';

declare class ExchangeCookie extends Cookie {
  constructor(exchange: Workflow.Exchange);
}

export { ExchangeCookie as Concrete };
