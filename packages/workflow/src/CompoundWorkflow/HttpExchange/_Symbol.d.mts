declare const I_RESPONSE: unique symbol;

/** Instance-side private slots of the HTTP exchange. */
export declare const I: {
  /** Response part. */
  readonly RESPONSE: typeof I_RESPONSE;
};

declare const _S_RESPONSE_CTOR: unique symbol;

/** Static-side slots of the HTTP exchange. */
export declare const _S: {
  /** Constructor of the mutable response part. */
  readonly RESPONSE_CTOR: typeof _S_RESPONSE_CTOR;
};
