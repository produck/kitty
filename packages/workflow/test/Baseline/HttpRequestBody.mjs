import { SubConstructorProxy as SCP } from '@produck/es-abstract';

import { Abstract, SYMBOL } from '@produck/kitty-workflow';

export default SCP(
  class HttpRequestBody extends Abstract.HttpRequestBody {
    [SYMBOL.HTTP_REQUEST_BODY._I.SOURCE.GET](internal) {
      return internal.body;
    }
  },
);
