declare const _I_GET_READY_STATE: unique symbol;
declare const _I_SEND: unique symbol;
declare const _I_CLOSE: unique symbol;

/** Instance-side abstract slots of the WebSocket controller. */
export declare const _I: {
  /** Ready state accessor. */
  readonly GET_READY_STATE: typeof _I_GET_READY_STATE;

  /** Frame writer. */
  readonly SEND: typeof _I_SEND;

  /** Closing handshake starter. */
  readonly CLOSE: typeof _I_CLOSE;
};
