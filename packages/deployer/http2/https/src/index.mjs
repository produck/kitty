import { instanceOf, Ow } from '@produck/argot';
import * as Workflow from '@produck/kitty-workflow';
import * as Http1Http from '@produck/kitty-deployer-http1-http';
import * as Http2Http from '@produck/kitty-deployer-http2-http';

import * as Intrinsic from './Intrinsic.mjs';
import * as Bridge from './Bridge.mjs';

export * as Exchange from './Exchange/index.mjs';
export * as Deployer from './Deployer.mjs';

export function useServer(Kit) {
  const server = Workflow.useServer(Kit);

  if (!instanceOf(server, Intrinsic.Http2SecureServer)) {
    Ow.Error.Common('The server on kit is NOT http2.Http2SecureServer.');
  }

  return server;
}

function getSocket(Kit) {
  const exchange = Workflow.useExchange(Kit);

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

export function useHttp1Request(Kit) {
  if (Workflow.useExchange(Kit).httpVersion !== '1.1') {
    Ow.Error.Common('The raw request is HTTP/1.1 only.');
  }

  return Http1Http.useHttp1Request(Kit);
}

export function useHttp2Stream(Kit) {
  if (Workflow.useExchange(Kit).httpVersion !== '2.0') {
    Ow.Error.Common('The raw stream is HTTP/2 only.');
  }

  return Http2Http.useHttp2Stream(Kit);
}
