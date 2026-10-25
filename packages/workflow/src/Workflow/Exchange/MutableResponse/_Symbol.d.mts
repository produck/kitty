declare const _I_STATUS_SET: unique symbol;
declare const _I_STATUS_TEXT_SET: unique symbol;

/** Instance-side abstract slots of the mutable response. */
export declare const _I: {
  /** Status code writer. */
  readonly STATUS: {
    /** Writes the status code. */
    readonly SET: typeof _I_STATUS_SET;
  };

  /** Reason phrase writer. */
  readonly STATUS_TEXT: {
    /** Writes the reason phrase. */
    readonly SET: typeof _I_STATUS_TEXT_SET;
  };
};
