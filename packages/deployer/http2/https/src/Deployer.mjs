import { Implement, useServer } from '@produck/kitty-workflow';
import * as Http2Http from '@produck/kitty-deployer-http2-http';

import * as Bridge from './Bridge.mjs';
import * as Exchange from './Exchange/index.mjs';
import { Http2SecureServer } from './Intrinsic.mjs';

const http2 = Http2Http.Exchange.Http.options;

export const options = Implement.Normalize.Deployer({
  tag: '2:https',
  server: Http2SecureServer,
  exchange: { http: Exchange.Http.Exchange },
  install({ Kit, handleHttpExchange, declareToManifest, setServerLinker }) {
    const server = useServer(Kit);

    async function requestListener(req, res) {
      if (req.httpVersion === '2.0') {
        return;
      }

      await handleHttpExchange({ server, req, res });

      if (!Bridge.hasWritten(res) && !res.writableEnded) {
        res.end();
      }
    }

    async function streamListener(stream, headers) {
      await handleHttpExchange({ server, stream, headers });

      if (stream.headersSent || stream.writableEnded || stream.destroyed) {
        return;
      }

      const internal = { server, stream, headers };
      const status = http2.response.status.get({ internal });

      stream.respond({ ':status': status });
      stream.end();
    }

    declareToManifest('request-listener', requestListener);
    declareToManifest('stream-listener', streamListener);

    setServerLinker((_context, next) => {
      server.on('request', requestListener);
      server.on('stream', streamListener);

      return next();
    });
  },
});

export class Http2HttpsDeployer extends Implement.Deployer(options) {}

export { Http2HttpsDeployer as Http2Https };
