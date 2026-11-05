import type * as http from 'node:http';

import type * as Workflow from '@produck/kitty-workflow';

/** Exchange parts served by this deployer. */
export declare const Exchange: Readonly<{
  /** Shared accessors reused by both protocol implementations. */
  Base: Readonly<Record<string, unknown>>;

  /** HTTP exchange: normalized ports and the produced class. */
  Http: Readonly<{
    options: ReturnType<typeof Workflow.Implement.Normalize.Exchange.Http>;
    Exchange: typeof Workflow.Abstract.HttpExchange;
  }>;
}>;

/**
 * Deployer class bound to `node:http` servers, able to carry a WebSocket
 * exchange.
 */
type Http1HttpDeployerClass = typeof Workflow.Abstract.Deployer & {
  /**
   * Derives a deployer that also serves the given WebSocket exchange.
   *
   * @param WebSocketExchange - WebSocket exchange class to load.
   * @returns A deployer subclass carrying that exchange.
   */
  withWebSocketExchange(
    WebSocketExchange: typeof Workflow.Abstract.WebSocketExchange,
  ): Http1HttpDeployerClass;
};

/** Deployer entry: the normalized implementation and the class. */
export declare const Deployer: Readonly<{
  options: ReturnType<typeof Workflow.Implement.Normalize.Deployer>;
  Http1HttpDeployer: Http1HttpDeployerClass;
  Http1Http: Http1HttpDeployerClass;
}>;

/**
 * Reads the deployed server and checks it is an `http.Server`.
 *
 * @param args - Same arguments as the workflow capability.
 * @returns The deployed server.
 */
export declare function useServer(
  ...args: Parameters<typeof Workflow.useServer>
): http.Server;

/**
 * Answers the node request behind the exchange and claims the raw path:
 * `request.body.data` throws afterwards.
 *
 * @param args - Same arguments as the workflow capability.
 * @returns The node request behind the exchange.
 */
export declare function useHttp1Request(
  ...args: Parameters<typeof Workflow.useExchange>
): http.IncomingMessage;

/**
 * Answers the node request without claiming the raw path, so the
 * distributor keeps the body. The request is for inspection only;
 * consuming it steals bytes from the distributor.
 *
 * @param args - Same arguments as the workflow capability.
 * @returns The node request behind the exchange.
 */
export declare function inspectHttp1Request(
  ...args: Parameters<typeof Workflow.useExchange>
): http.IncomingMessage;
