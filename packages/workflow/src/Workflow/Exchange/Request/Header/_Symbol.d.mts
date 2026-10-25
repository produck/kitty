declare const _I_GET: unique symbol;
declare const _I_KEYS: unique symbol;

/** Instance-side abstract slots of the request header part. */
export declare const _I: {
  /** Reads one header. */
  readonly GET: typeof _I_GET;

  /** Lists every header name. */
  readonly KEYS: typeof _I_KEYS;
};
