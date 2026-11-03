/** Controller event types. */
export declare const TYPE: {
  readonly OPEN: 'open';
  readonly MESSAGE: 'message';
  readonly CLOSE: 'close';
  readonly ERROR: 'error';
};

/** WebSocket ready states; same values as the platform constants. */
export declare const READY_STATE: {
  readonly CONNECTING: 0;
  readonly OPEN: 1;
  readonly CLOSING: 2;
  readonly CLOSED: 3;
};

/** The `message` event, carrying one inbound frame. */
declare class MessageEvent extends Event {
  /**
   * @param data - Frame payload; text arrives as a string.
   * @param isBinary - Whether the frame is binary.
   */
  constructor(data: string | Uint8Array, isBinary: boolean);

  /** Frame payload. */
  readonly data: string | Uint8Array;

  /** Whether the frame is binary. */
  readonly isBinary: boolean;
}

/** The `close` event, carrying the close code and reason. */
declare class CloseEvent extends Event {
  /**
   * @param code - Close code.
   * @param reason - Close reason.
   */
  constructor(code: number, reason: string);

  /** Close code. */
  readonly code: number;

  /** Close reason. */
  readonly reason: string;
}

/** The `error` event, carrying the underlying failure. */
declare class ErrorEvent extends Event {
  /**
   * @param error - The failure raised by the connection.
   */
  constructor(error: unknown);

  /** The failure raised by the connection. */
  readonly error: unknown;
}

export { MessageEvent as Message, CloseEvent as Close, ErrorEvent as Error };
