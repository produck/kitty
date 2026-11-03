/**
 * Event sink for one WebSocket controller: the three listeners deliver the
 * transport events back into the controller.
 */
declare class Notifier {
  /**
   * @param controller - Controller the listeners dispatch through.
   */
  constructor(controller: EventTarget);

  /** Listener for the `message` event. */
  readonly message: (data: string | Uint8Array, isBinary: boolean) => void;

  /** Listener for the `close` event. */
  readonly close: (code: number, reason: string) => void;

  /** Listener for the `error` event. */
  readonly error: (error: unknown) => void;
}

export { Notifier as Concrete };
