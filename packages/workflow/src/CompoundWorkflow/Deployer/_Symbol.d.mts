declare const _I_INSTALL: unique symbol;

/** Instance-side abstract slots of the deployer. */
export declare const _I: {
  /** Writes the deployment definition. */
  readonly INSTALL: typeof _I_INSTALL;
};

declare const _S_TAG: unique symbol;
declare const _S_SERVER_CTOR: unique symbol;
declare const _S_HTTP_EXCHANGE_CTOR: unique symbol;
declare const _S_WEB_SOCKET_EXCHANGE_CTOR: unique symbol;

/** Static-side abstract slots of the deployer. */
export declare const _S: {
  /** The deployer tag. */
  readonly TAG: typeof _S_TAG;

  /** Target server constructor; also the registry key. */
  readonly SERVER_CTOR: typeof _S_SERVER_CTOR;

  /** Exchange constructors served by this deployer. */
  readonly EXCHANGE_CTOR: {
    /** HTTP exchange constructor. */
    readonly HTTP: typeof _S_HTTP_EXCHANGE_CTOR;

    /** WebSocket exchange constructor; may be absent. */
    readonly WEB_SOCKET: typeof _S_WEB_SOCKET_EXCHANGE_CTOR;
  };
};
