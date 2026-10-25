declare const _I_SET: unique symbol;
declare const _I_DELETE: unique symbol;

/** Instance-side abstract slots of the mutable response header. */
export declare const _I: {
  /** Writes one header. */
  readonly SET: typeof _I_SET;

  /** Removes one header. */
  readonly DELETE: typeof _I_DELETE;
};
