import * as http from 'node:http';

import { SubConstructorProxy as SCP } from '@produck/es-abstract';
import { Abstract, SYMBOL, useServer } from '@produck/kitty-workflow';

import Exchange, { WRITING } from './Exchange.mjs';

const TAG = 'http1-http';

function finish(res) {
  if (WRITING.has(res) || res.writableEnded) {
    return;
  }

  res.end();
}

function fail(res) {
  if (WRITING.has(res) || res.headersSent) {
    res.destroy();

    return;
  }

  res.statusCode = 500;
  res.statusMessage = 'Internal Server Error';
  res.end();
}

class Http1HttpDeployer extends Abstract.Deployer {
  static get [SYMBOL.DEPLOYER._S.TAG]() {
    return TAG;
  }

  static get [SYMBOL.DEPLOYER._S.SERVER_CTOR]() {
    return http.Server;
  }

  static get [SYMBOL.DEPLOYER._S.EXCHANGE_CTOR.HTTP]() {
    return Exchange;
  }

  [SYMBOL.DEPLOYER._I.INSTALL]({
    Kit,
    handleHttpExchange,
    declare,
    setServerLinker,
  }) {
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
  }
}

export default SCP(Http1HttpDeployer);
