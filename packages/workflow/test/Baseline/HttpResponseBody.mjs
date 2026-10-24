import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

export default SCP(
  class HttpResponseBody extends Abstract.HttpResponseBody {
    [SYMBOL.HTTP_RESPONSE_BODY._I.DATA.SET](internal, data) {
      internal.responseBody = data;
    }
  },
);
