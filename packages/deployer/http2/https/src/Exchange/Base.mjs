import * as Http1Http from '@produck/kitty-deployer-http1-http';
import * as Http2Http from '@produck/kitty-deployer-http2-http';

import * as VersionRoute from './VersionRoute.mjs';

const ref = {
  h1: Http1Http.Exchange.Http.options,
  h2: Http2Http.Exchange.Http.options,
};

export const identity = {
  get: VersionRoute.byInternal({
    h1: ref.h1.identity.get,
    h2: ref.h2.identity.get,
  }),
};

export const server = {
  get: ref.h2.server.get,
  protocol: {
    get: () => 'https:',
  },
};

export const httpVersion = {
  get: VersionRoute.byContext({
    h1: ref.h1.httpVersion.get,
    h2: ref.h2.httpVersion.get,
  }),
};

export const request = {
  method: {
    get: VersionRoute.byContext({
      h1: ref.h1.request.method.get,
      h2: ref.h2.request.method.get,
    }),
  },
  URL: {
    get: VersionRoute.byContext({
      h1: ref.h1.request.URL.get,
      h2: ref.h2.request.URL.get,
    }),
  },
  header: {
    get: VersionRoute.byContext({
      h1: ref.h1.request.header.get,
      h2: ref.h2.request.header.get,
    }),
    keys: VersionRoute.byContext({
      h1: ref.h1.request.header.keys,
      h2: ref.h2.request.header.keys,
    }),
  },
};
