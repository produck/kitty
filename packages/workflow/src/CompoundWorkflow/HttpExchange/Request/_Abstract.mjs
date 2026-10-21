import { Ow, SYMBOL } from '@produck/argot';
import Abstract from '@produck/es-abstract';
import { SubConstructorOf } from '@produck/es-abstract-member-constructor';

import * as Workflow from '../../../Workflow/index.mjs';
import * as Configuration from '../../Configuration/index.mjs';
import * as Body from './Body/index.mjs';
import { I, _S } from './_Symbol.mjs';

class HttpRequest extends Workflow.Exchange.Request.Abstract {
  constructor(exchange) {
    super(exchange);
    this[I.BODY] = new this[SYMBOL.CONSTRUCTOR][_S.BODY_CTOR](exchange);
  }

  get body() {
    const { method, workflow } = this;
    const allowed = Configuration.Get.AllowedBodyMethods(workflow);

    if (!allowed.includes(method)) {
      Ow.Error.Common(`It MUST NOT read a body for the ${method} method.`);
    }

    return this[I.BODY];
  }
}

export default Abstract(
  HttpRequest,
  Abstract.Static({
    [_S.BODY_CTOR]: SubConstructorOf(Body.Abstract),
  }),
);
