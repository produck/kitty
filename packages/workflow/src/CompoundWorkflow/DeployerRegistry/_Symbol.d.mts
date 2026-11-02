declare const I_REGISTRY: unique symbol;
declare const I_INSTANCE_MAP: unique symbol;

/** Instance-side private slots of the deployer registry. */
export declare const I: {
  /** Server-constructor to deployer-class map. */
  readonly REGISTRY: typeof I_REGISTRY;

  /** One-time server instance to deployer-class map. */
  readonly INSTANCE_MAP: typeof I_INSTANCE_MAP;
};

declare const $I_RESOLVE: unique symbol;
declare const $I_ASSOCIATE: unique symbol;

/** Instance-side protected members of the deployer registry. */
export declare const $I: {
  /** Resolves the deployer class for a server instance. */
  readonly RESOLVE: typeof $I_RESOLVE;

  /** Associates a one-time server instance with a deployer class. */
  readonly ASSOCIATE: typeof $I_ASSOCIATE;
};
