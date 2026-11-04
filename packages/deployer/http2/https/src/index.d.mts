import type * as http2 from 'node:http2';

import type * as Workflow from '@produck/kitty-workflow';

/** Exchange parts served by this deployer. */
export declare const Exchange: Readonly<{
  /** HTTP exchange: normalized ports and the produced class. */
  Http: Readonly<{
    options: ReturnType<typeof Workflow.Implement.Normalize.Exchange.Http>;
    Exchange: typeof Workflow.Abstract.HttpExchange;
  }>;
}>;

/** Deployer entry: the normalized implementation and the class. */
export declare const Deployer: Readonly<{
  options: ReturnType<typeof Workflow.Implement.Normalize.Deployer>;
  Http2HttpsDeployer: typeof Workflow.Abstract.Deployer;
  Http2Https: typeof Workflow.Abstract.Deployer;
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
 * Hands over the raw `http2.ServerHttp2Stream` of the current exchange.
 *
 * Only available for HTTP/2 exchanges; an HTTP/1.1 exchange on the same
 * server raises an error, since it has no h2 stream.
 *
 * @param args - Same arguments as the workflow capability.
 * @returns The h2 stream bound to the exchange.
 */
export declare function useRawStream(
  ...args: Parameters<typeof Workflow.useExchange>
): http2.ServerHttp2Stream;
