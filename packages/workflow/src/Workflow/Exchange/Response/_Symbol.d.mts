declare const _I_STATUS_GET: unique symbol;
declare const _I_STATUS_TEXT_GET: unique symbol;
declare const _I_IS_FINISHED: unique symbol;

/** Instance-side abstract slots of the response part. */
export declare const _I: {
  /** Status code accessor. */
  readonly STATUS: {
    /** Reads the status code. */
    readonly GET: typeof _I_STATUS_GET;
  };

  /** Reason phrase accessor. */
  readonly STATUS_TEXT: {
    /** Reads the reason phrase. */
    readonly GET: typeof _I_STATUS_TEXT_GET;
  };

  /** Completion probe. */
  readonly IS_FINISHED: typeof _I_IS_FINISHED;
};

declare const _S_HEADER_CTOR: unique symbol;

/** Static-side abstract slots of the response part. */
export declare const _S: {
  /** Constructor of the response header part. */
  readonly HEADER_CTOR: typeof _S_HEADER_CTOR;
};
