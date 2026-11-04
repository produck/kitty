import type * as http from 'node:http';
import type * as http2 from 'node:http2';
import type * as tls from 'node:tls';

import type * as Workflow from '@produck/kitty-workflow';

/** Exchange parts served by this deployer. */
export declare const Exchange: Readonly<{
  /** HTTP exchange: normalized ports and the produced class. */
  Http: Readonly<{
    options: ReturnType<typeof Workflow.Implement.Normalize.Exchange.Http>;
    Exchange: typeof Workflow.Abstract.HttpExchange;
  }>;
}>;

/**
 * Deployer class bound to `node:http2` TLS servers, able to carry a WebSocket
 * exchange.
 */
type Http2HttpsDeployerClass = typeof Workflow.Abstract.Deployer & {
  /**
   * Derives a deployer that also serves the given WebSocket exchange.
   *
   * @param WebSocketExchange - WebSocket exchange class to load.
   * @returns A deployer subclass carrying that exchange.
   */
  withWebSocketExchange(
    WebSocketExchange: typeof Workflow.Abstract.WebSocketExchange,
  ): Http2HttpsDeployerClass;
};

/** Deployer entry: the normalized implementation and the class. */
export declare const Deployer: Readonly<{
  options: ReturnType<typeof Workflow.Implement.Normalize.Deployer>;
  Http2HttpsDeployer: Http2HttpsDeployerClass;
  Http2Https: Http2HttpsDeployerClass;
}>;

/**
 * Reads the deployed server and checks it is an `http2.Http2SecureServer`.
 *
 * @param args - Same arguments as the workflow capability.
 * @returns The deployed server.
 */
export declare function useServer(
  ...args: Parameters<typeof Workflow.useServer>
): http2.Http2SecureServer;

/**
 * Reads the SNI name the client sent during the TLS handshake.
 *
 * @param args - Same arguments as the workflow capability.
 * @returns The server name, or `undefined` when the client sent none.
 */
export declare function useServername(
  ...args: Parameters<typeof Workflow.useExchange>
): string | undefined;

/**
 * Reads the outcome of verifying the client certificate.
 *
 * @param args - Same arguments as the workflow capability.
 * @returns Verification state and the reason it failed.
 */
export declare function useAuthorization(
  ...args: Parameters<typeof Workflow.useExchange>
): Readonly<{
  authorized: boolean;
  error: string | null;
}>;

/**
 * Reads the certificate the client presented.
 *
 * @param args - Same arguments as the workflow capability.
 * @returns The peer certificate, empty when the client presented none.
 */
export declare function useCertificate(
  ...args: Parameters<typeof Workflow.useExchange>
): tls.PeerCertificate;

/**
 * Reads the cipher suite and TLS version negotiated for the connection.
 *
 * @param args - Same arguments as the workflow capability.
 * @returns The negotiated cipher.
 */
export declare function useCipher(
  ...args: Parameters<typeof Workflow.useExchange>
): tls.CipherNameAndProtocol;

/**
 * Reads the ALPN protocol negotiated for the connection.
 *
 * @param args - Same arguments as the workflow capability.
 * @returns The protocol name, or `false` when none was negotiated.
 */
export declare function useAlpnProtocol(
  ...args: Parameters<typeof Workflow.useExchange>
): string | false;

/**
 * Hands over the raw `http.IncomingMessage` of the current exchange.
 *
 * Only available for HTTP/1.1 exchanges; an HTTP/2 exchange on the same
 * server raises an error, since it has no incoming message.
 *
 * @param args - Same arguments as the workflow capability.
 * @returns The node request bound to the exchange.
 */
export declare function useHttp1Request(
  ...args: Parameters<typeof Workflow.useExchange>
): http.IncomingMessage;

/**
 * Hands over the raw `http2.ServerHttp2Stream` of the current exchange.
 *
 * Only available for HTTP/2 exchanges; an HTTP/1.1 exchange on the same
 * server raises an error, since it has no h2 stream.
 *
 * @param args - Same arguments as the workflow capability.
 * @returns The h2 stream bound to the exchange.
 */
export declare function useHttp2Stream(
  ...args: Parameters<typeof Workflow.useExchange>
): http2.ServerHttp2Stream;
