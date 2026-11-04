import type * as Workflow from '@produck/kitty-workflow';

/** Normalized ports of the WebSocket exchange implementation. */
export declare const options: ReturnType<
  typeof Workflow.Implement.Normalize.Exchange.WebSocket
>;

/** WebSocket exchange class built from those ports. */
export declare const Exchange: typeof Workflow.Abstract.WebSocketExchange;
