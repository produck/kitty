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

  /** Whether the handshake has been accepted. */
  readonly upgraded: boolean;

  /**
   * Completes the handshake, turning the incoming connection into a web
   * socket. The deployer never calls it; the handler owns this step.
   *
   * @throws When the handshake has already been settled.
   */
  acceptUpgrade(): void;

  /**
   * Rejects the handshake, answering with a plain HTTP error status instead
   * of switching protocols. The deployer never calls it; the handler owns
   * this step.
   *
   * @param status - HTTP error status code, within 400..599.
   * @param reason - Reason phrase; defaults to the standard phrase.
   * @throws When the handshake has already been settled.
   */
  rejectUpgrade(status?: number, reason?: string): void;

  /**
   * Current ready state: 0 connecting, 1 open, 2 closing, 3 closed.
   *
   * @throws When the handshake has not been completed yet.
   */
  readonly readyState: 0 | 1 | 2 | 3;

  /**
   * Sends one text or binary frame.
   *
   * @param data - Text or binary payload.
   * @throws When the handshake has not been completed yet.
   */
  send(data: string | Uint8Array): void;

  /**
   * Starts the closing handshake.
   *
   * @param code - Close code; uses the platform default when omitted.
   * @param reason - Close reason.
   * @throws When the handshake has not been completed yet.
   */
  close(code?: number, reason?: string): void;

  /**
   * Implementation: reads the ready state.
   *
   * @param internal - Connection record supplied by the deployer.
   * @returns The ready state.
   */
  [_Symbol._I.GET_READY_STATE](internal: Internal): 0 | 1 | 2 | 3;

  /**
   * Implementation: sends one frame.
   *
   * @param internal - Connection record supplied by the deployer.
   * @param data - Text or binary payload.
   */
  [_Symbol._I.SEND](internal: Internal, data: string | Uint8Array): void;

  /**
   * Implementation: writes the rejection response and ends the connection.
   *
   * @param internal - Connection record supplied by the deployer.
   * @param status - HTTP error status code, within 400..599.
   * @param reason - Reason phrase.
   */
  [_Symbol._I.REJECT_UPGRADE](
    internal: Internal,
    status: number,
    reason: string,
  ): void;

  [_Symbol._I.CLOSE](
    internal: Internal,
    code: number | undefined,
    reason: string | undefined,
  ): void;
}

export { WebSocketController as Abstract };
