import * as http from 'node:http';

import { Implement, useServer } from '@produck/kitty-workflow';

import Exchange from './Exchange.mjs';
import { fail, finish } from './_patch.mjs';

export default Implement.Deployer({
  tag: 'http1-http',
  server: http.Server,
  exchange: { http: Exchange },
  install({ Kit, handleHttpExchange, declare, setServerLinker }) {
    const server = useServer(Kit);

    function listener(req, res) {
      const internal = { server, req, res };

      handleHttpExchange(internal).then(
        () => finish(res),
        () => fail(res),
      );
    }

    declare('request-listener', listener);

    setServerLinker((_context, next) => {
      server.on('request', listener);

      return next();
    });
  },
});
