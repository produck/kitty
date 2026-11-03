import { Implement } from '@produck/kitty-workflow';
import * as Http1Http from '@produck/kitty-deployer-http1-http';

import * as Bridge from '../Bridge.mjs';

const http = Http1Http.Exchange.Http.options;

export const options = Implement.Normalize.Exchange.Http({
  ...http,
  server: {
    ...http.server,
    protocol: {
      get: () => 'https:',
    },
  },
  request: {
    ...http.request,
    body: {
      source: {
        get: (...args) => {
          const [{ self, internal }] = args;

          Bridge.bindExchangeSocket(self.exchange, internal.req.socket);

          return http.request.body.source.get(...args);
        },
      },
    },
  },
});

export const Exchange = Implement.Exchange.Http(options);
