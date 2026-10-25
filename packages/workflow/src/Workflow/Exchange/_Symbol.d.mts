declare const _I_HTTP_VERSION: unique symbol;
declare const _I_MODE_GET: unique symbol;
declare const _I_SERVER_GET: unique symbol;
declare const _I_SERVER_PROTOCOL_GET: unique symbol;

/** Instance-side abstract slots of the exchange shell. */
export declare const _I: {
  /** HTTP version accessor. */
  readonly HTTP_VERSION: typeof _I_HTTP_VERSION;

  /** Exchange mode accessor. */
  readonly MODE: typeof _I_MODE_GET;

  /** Server accessors. */
  readonly SERVER: {
    /** Reads the server instance. */
    readonly GET: typeof _I_SERVER_GET;

    /** Server protocol accessor. */
    readonly PROTOCOL: {
      /** Reads the server protocol. */
      readonly GET: typeof _I_SERVER_PROTOCOL_GET;
    };
  };
};

declare const _S_IDENTITY: unique symbol;
declare const _S_REQUEST_CTOR: unique symbol;
declare const _S_RESPONSE_CTOR: unique symbol;

/** Static-side abstract slots of the exchange shell. */
export declare const _S: {
  /** Extracts the dedup identity from a connection record. */
  readonly IDENTITY: typeof _S_IDENTITY;

  /** Constructor of the request part. */
  readonly REQUEST_CTOR: typeof _S_REQUEST_CTOR;

  /** Constructor of the mutable response part. */
  readonly RESPONSE_CTOR: typeof _S_RESPONSE_CTOR;
};
