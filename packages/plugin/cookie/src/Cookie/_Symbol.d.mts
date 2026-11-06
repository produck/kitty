declare const _I_READ: unique symbol;
declare const _I_WRITE: unique symbol;

export declare const _I: {
  readonly READ: typeof _I_READ;
  readonly WRITE: typeof _I_WRITE;
};
