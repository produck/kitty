declare const _I_READY_STATE_GET: unique symbol;
declare const _I_SEND: unique symbol;
declare const _I_CLOSE: unique symbol;

/** Instance-side abstract slots of the WebSocket controller. */
export declare const _I: {
  /** Ready state accessor. */
  readonly READY_STATE: {
    /** Reads the ready state. */
    readonly GET: typeof _I_READY_STATE_GET;
  };

  /** Frame writer. */
  readonly SEND: typeof _I_SEND;

  /** Closing handshake starter. */
  readonly CLOSE: typeof _I_CLOSE;
};
