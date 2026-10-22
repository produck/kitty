import Abstract from '@produck/es-abstract';

import * as Workflow from '../../../Workflow/index.mjs';

class WebSocketResponse extends Workflow.Exchange.Response.Abstract {
  get isFinished() {
    return true;
  }
}

export default Abstract(WebSocketResponse, Abstract({}));
