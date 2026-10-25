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

export { CloseEvent as Close };
