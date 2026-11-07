import type * as https from 'node:https';
import type * as tls from 'node:tls';

import type * as Workflow from '@produck/kitty-workflow';

export {
  useHttp1Request,
  inspectHttp1Request,
} from '@produck/kitty-deployer-http1-http';

/** Deployer class bound to `node:https` servers, able to carry a WebSocket
 * exchange.
 */
type Http1HttpsDeployerClass = typeof Workflow.Abstract.Deployer & {
  /**
   * Derives a deployer that also serves the given WebSocket exchange.
   *
   * @param WebSocketExchange - WebSocket exchange class to load.
   * @returns A deployer subclass carrying that exchange.
   */
  withWebSocketExchange(
    WebSocketExchange: typeof Workflow.Abstract.WebSocketExchange,
  ): Http1HttpsDeployerClass;
};

/** Deployer entry: the normalized implementation and the class. */
export declare const Deployer: Readonly<{
  options: ReturnType<typeof Workflow.Implement.Normalize.Deployer>;
  Http1HttpsDeployer: Http1HttpsDeployerClass;
}>;

/**
 * Reads the deployed server and checks it is an `https.Server`.
 *
 * @param args - Same arguments as the workflow capability.
 * @returns The deployed server.
 */
export declare function useServer(
  ...args: Parameters<typeof Workflow.Use.Server>
): https.Server;

/**
 * Reads the SNI name the client sent during the TLS handshake.
 *
 * @param args - Same arguments as the workflow capability.
 * @returns The server name, or `undefined` when the client sent none.
 */
export declare function useServername(
  ...args: Parameters<typeof Workflow.Use.Exchange>
): string | undefined;

/**
 * Reads the outcome of verifying the client certificate.
 *
 * @param args - Same arguments as the workflow capability.
 * @returns Verification state and the reason it failed.
 */
export declare function useAuthorization(
  ...args: Parameters<typeof Workflow.Use.Exchange>
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
  ...args: Parameters<typeof Workflow.Use.Exchange>
): tls.PeerCertificate;

/**
 * Reads the cipher suite and TLS version negotiated for the connection.
 *
 * @param args - Same arguments as the workflow capability.
 * @returns The negotiated cipher.
 */
export declare function useCipher(
  ...args: Parameters<typeof Workflow.Use.Exchange>
): tls.CipherNameAndProtocol;

/**
 * Reads the ALPN protocol negotiated for the connection.
 *
 * @param args - Same arguments as the workflow capability.
 * @returns The protocol name, or `false` when none was negotiated.
 */
export declare function useAlpnProtocol(
  ...args: Parameters<typeof Workflow.Use.Exchange>
): string | false;
