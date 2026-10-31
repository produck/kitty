import * as http from 'node:http';

import { Implement, useServer } from '@produck/kitty-workflow';

import * as Exchange from './Exchange/index.mjs';
import * as ResponseBody from './ResponseBody.mjs';

export default Implement.Deployer({
  tag: 'http1-http',
  server: http.Server,
  exchange: { http: Exchange.Http.Exchange },
  install({ Kit, handleHttpExchange, declare, setServerLinker }) {
    const server = useServer(Kit);

    async function requestListener(req, res) {
      await handleHttpExchange({ server, req, res });

      if (!ResponseBody.isRegistered(res) && !res.writableEnded) {
        res.end();
      }
    }

    declare('request-listener', requestListener);

    setServerLinker((_context, next) => {
      server.on('request', requestListener);

      return next();
    });
  },
});
