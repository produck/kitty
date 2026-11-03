import type * as https from 'node:https';

import type * as Workflow from '@produck/kitty-workflow';

export { Exchange } from '@produck/kitty-deployer-http1-http';

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
  ...args: Parameters<typeof Workflow.useServer>
): https.Server;
