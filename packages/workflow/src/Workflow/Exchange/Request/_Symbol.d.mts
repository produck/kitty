declare const _I_METHOD_GET: unique symbol;
declare const _I_URL_GET: unique symbol;

/** Instance-side abstract slots of the request part. */
export declare const _I: {
  /** Request method accessor. */
  readonly METHOD: {
    /** Reads the request method. */
    readonly GET: typeof _I_METHOD_GET;
  };

  /** URL accessor. */
  readonly URL: {
    /** Reads the raw URL string. */
    readonly GET: typeof _I_URL_GET;
  };
};

declare const _S_HEADER_CTOR: unique symbol;

/** Static-side abstract slots of the request part. */
export declare const _S: {
  /** Constructor of the request header part. */
  readonly HEADER_CTOR: typeof _S_HEADER_CTOR;
};
