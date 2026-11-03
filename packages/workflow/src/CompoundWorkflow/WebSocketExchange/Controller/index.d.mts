import type * as Part from '../../../Workflow/Exchange/Part/index.d.mts';
import type * as Exchange from '../../../Workflow/Exchange/index.d.mts';
import type * as ControllerEvent from './Event.d.mts';
import type * as Notifier from './Notifier/index.d.mts';
import type * as _Symbol from './_Symbol.d.mts';

/** Slot context: the connection record plus the event sink. */
export declare interface Context<Internal = object> {
  /** Connection record supplied by the deployer. */
  readonly internal: Internal;

  /** Event sink; the implementation wires the transport events into it. */
  readonly notifier: Notifier.Concrete;
}

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
   * Listens for one inbound frame.
   *
   * @param type - Event type.
   * @param listener - Receives the frame event.
   * @param options - Listener options.
   */
  addEventListener(
    type: 'message',
    listener: (event: ControllerEvent.Message) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;

  /**
   * Listens for the close of the connection.
   *
   * @param type - Event type.
   * @param listener - Receives the close event.
   * @param options - Listener options.
   */
  addEventListener(
    type: 'close',
    listener: (event: ControllerEvent.Close) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;

  /**
   * Listens for a connection failure.
   *
   * @param type - Event type.
   * @param listener - Receives the error event.
   * @param options - Listener options.
   */
  addEventListener(
    type: 'error',
    listener: (event: ControllerEvent.Error) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void;

  /**
   * Implementation: reads the ready state.
   *
   * @param context - Slot context.
   * @returns The ready state.
   */
  [_Symbol._I.GET_READY_STATE](context: Context<Internal>): 0 | 1 | 2 | 3;

  /**
   * Implementation: sends one frame.
   *
   * @param context - Slot context.
   * @param data - Text or binary payload.
   */
  [_Symbol._I.SEND](
    context: Context<Internal>,
    data: string | Uint8Array,
  ): void;

  /**
   * Implementation: writes the rejection response and ends the connection.
   *
   * @param context - Slot context.
   * @param status - HTTP error status code, within 400..599.
   * @param reason - Reason phrase.
   */
  [_Symbol._I.REJECT_UPGRADE](
    context: Context<Internal>,
    status: number,
    reason: string,
  ): void;

  [_Symbol._I.CLOSE](
    context: Context<Internal>,
    code: number | undefined,
    reason: string | undefined,
  ): void;
}

export { WebSocketController as Abstract };
