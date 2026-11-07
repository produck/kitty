import * as https from 'node:https';

import { instanceOf, Ow } from '@produck/argot';
import * as Workflow from '@produck/kitty-workflow';

import * as Bridge from './Bridge.mjs';

export {
  useHttp1Request,
  inspectHttp1Request,
} from '@produck/kitty-deployer-http1-http';

export * as Deployer from './Deployer.mjs';

export function useServer(Kit) {
  const server = Workflow.Use.Server(Kit);

  if (!instanceOf(server, https.Server)) {
    Ow.Error.Common('The server on kit is NOT https.Server.');
  }

  return server;
}

function getSocket(Kit) {
  const exchange = Workflow.Use.Exchange(Kit);

  return Bridge.getSocketByExchange(exchange);
}

export function useServername(Kit) {
  return getSocket(Kit).servername;
}

export function useAuthorization(Kit) {
  const socket = getSocket(Kit);

  return {
    authorized: socket.authorized,
    error: socket.authorizationError ?? null,
  };
}

export function useCertificate(Kit) {
  return getSocket(Kit).getPeerCertificate();
}

export function useCipher(Kit) {
  return getSocket(Kit).getCipher();
}

export function useAlpnProtocol(Kit) {
  return getSocket(Kit).alpnProtocol;
}
