declare const _I_DATA_SET: unique symbol;

/** Instance-side abstract slots of the HTTP response body. */
export declare const _I: {
  /** Body data writer. */
  readonly DATA: {
    /** Writes the body data. */
    readonly SET: typeof _I_DATA_SET;
  };
};
