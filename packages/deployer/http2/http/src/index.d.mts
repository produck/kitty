import type * as http2 from 'node:http2';

import type * as Workflow from '@produck/kitty-workflow';

/** Exchange parts served by this deployer. */
export declare const Exchange: Readonly<{
  /** Shared accessors: identity, server, http version, request and response. */
  Base: Readonly<Record<string, unknown>>;

  /** HTTP exchange: normalized ports and the produced class. */
  Http: Readonly<{
    options: ReturnType<typeof Workflow.Implement.Normalize.Exchange.Http>;
    Exchange: typeof Workflow.Abstract.HttpExchange;
  }>;
}>;

/**
 * Deployer class bound to `node:http2` cleartext servers, able to carry a
 * WebSocket exchange.
 */
type Http2HttpDeployerClass = typeof Workflow.Abstract.Deployer & {
  /**
   * Derives a deployer that also serves the given WebSocket exchange.
   *
   * @param WebSocketExchange - WebSocket exchange class to load.
   * @returns A deployer subclass carrying that exchange.
   */
  withWebSocketExchange(
    WebSocketExchange: typeof Workflow.Abstract.WebSocketExchange,
  ): Http2HttpDeployerClass;
};

/** Deployer entry: the normalized implementation and the class. */
export declare const Deployer: Readonly<{
  options: ReturnType<typeof Workflow.Implement.Normalize.Deployer>;
  Http2HttpDeployer: Http2HttpDeployerClass;
  Http2Http: Http2HttpDeployerClass;
}>;

/**
 * Reads the deployed server and checks it is an `http2.Http2Server`.
 *
 * @param args - Same arguments as the workflow capability.
 * @returns The deployed server.
 */
export declare function useServer(
  ...args: Parameters<typeof Workflow.Use.Server>
): http2.Http2Server;

/**
 * Answers the node stream behind the exchange and claims the raw path:
 * `request.body.data` throws afterwards.
 *
 * @param args - Same arguments as the workflow capability.
 * @returns The node stream behind the exchange.
 */
export declare function useHttp2Stream(
  ...args: Parameters<typeof Workflow.Use.Exchange>
): http2.ServerHttp2Stream;

/**
 * Answers the node stream without claiming the raw path, so the
 * distributor keeps the body. The stream is for inspection only;
 * consuming it steals bytes from the distributor.
 *
 * @param args - Same arguments as the workflow capability.
 * @returns The node stream behind the exchange.
 */
export declare function inspectHttp2Stream(
  ...args: Parameters<typeof Workflow.Use.Exchange>
): http2.ServerHttp2Stream;
