import { Implement, useServer } from '@produck/kitty-workflow';

import * as Bridge from './Bridge.mjs';
import * as Exchange from './Exchange/index.mjs';
import { Http2Server } from './Intrinsic.mjs';

export const options = Implement.Normalize.Deployer({
  tag: '2:http',
  server: Http2Server,
  exchange: { http: Exchange.Http.Exchange },
  install({ Kit, handleHttpExchange, declareToManifest, setServerLinker }) {
    const server = useServer(Kit);

    async function streamListener(stream, headers) {
      await handleHttpExchange({ server, stream, headers });

      const response = Bridge.getResponse(stream);

      if (response.responded || stream.writableEnded || stream.destroyed) {
        return;
      }

      response.responded = true;
      stream.respond({ ':status': response.status });
      stream.end();
    }

    declareToManifest('stream-listener', streamListener);

    setServerLinker((_context, next) => {
      server.on('stream', streamListener);

      return next();
    });
  },
});

export class Http2HttpDeployer extends Implement.Deployer(options) {}

export { Http2HttpDeployer as Http2Http };
