import { instanceOf, Ow } from '@produck/argot';
import * as Workflow from '@produck/kitty-workflow';
import * as Http1Http from '@produck/kitty-deployer-http1-http';
import * as Http2Http from '@produck/kitty-deployer-http2-http';

import * as Intrinsic from './Intrinsic.mjs';
import * as Bridge from './Bridge.mjs';

export * as Exchange from './Exchange/index.mjs';
export * as Deployer from './Deployer.mjs';

export function useServer(Kit) {
  const server = Workflow.Use.Server(Kit);

  if (!instanceOf(server, Intrinsic.Http2SecureServer)) {
    Ow.Error.Common('The server on kit is NOT http2.Http2SecureServer.');
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

const VERSION_MESSAGE = {
  ['1']: 'The raw request is HTTP/1.x only.',
  ['2']: 'The raw stream is HTTP/2 only.',
};

function assertProtocol(Kit, major) {
  const { httpVersion } = Workflow.Use.Exchange(Kit);

  if (!httpVersion.startsWith(`${major}.`)) {
    Ow.Error.Common(VERSION_MESSAGE[major]);
  }
}

export function useHttp1Request(Kit) {
  assertProtocol(Kit, '1');

  return Http1Http.useHttp1Request(Kit);
}

export function inspectHttp1Request(Kit) {
  assertProtocol(Kit, '1');

  return Http1Http.inspectHttp1Request(Kit);
}

export function useHttp2Stream(Kit) {
  assertProtocol(Kit, '2');

  return Http2Http.useHttp2Stream(Kit);
}

export function inspectHttp2Stream(Kit) {
  assertProtocol(Kit, '2');

  return Http2Http.inspectHttp2Stream(Kit);
}
