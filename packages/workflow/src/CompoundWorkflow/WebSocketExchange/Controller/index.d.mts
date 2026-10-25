import type * as Part from '../../../Workflow/Exchange/Part/index.d.mts';
import type * as Exchange from '../../../Workflow/Exchange/index.d.mts';
import type * as _Symbol from './_Symbol.d.mts';

/** WebSocket controller: connection state and outbound frames. */
declare class WebSocketController<
  Internal = object,
> extends Part.Concrete<Internal> {
  /**
   * @param exchange - Exchange this part belongs to.
   */
  constructor(exchange: Exchange.Abstract<Internal>);

  /** Current ready state: 0 connecting, 1 open, 2 closing, 3 closed. */
  readonly readyState: 0 | 1 | 2 | 3;

  /**
   * Sends one text or binary frame.
   *
   * @param data - Text or binary payload.
   */
  send(data: string | Uint8Array): void;

  /**
   * Starts the closing handshake.
   *
   * @param code - Close code; uses the platform default when omitted.
   * @param reason - Close reason.
   */
  close(code?: number, reason?: string): void;

  /**
   * Implementation: reads the ready state.
   *
   * @param internal - Connection record supplied by the deployer.
   * @returns The ready state.
   */
  [_Symbol._I.READY_STATE.GET](internal: Internal): 0 | 1 | 2 | 3;

  /**
   * Implementation: sends one frame.
   *
   * @param internal - Connection record supplied by the deployer.
   * @param data - Text or binary payload.
   */
  [_Symbol._I.SEND](internal: Internal, data: string | Uint8Array): void;

  /**
   * Implementation: starts the closing handshake.
   *
   * @param internal - Connection record supplied by the deployer.
   * @param args - Close code and reason.
   */
  [_Symbol._I.CLOSE](internal: Internal, ...args: unknown[]): void;
}

export { WebSocketController as Abstract };
