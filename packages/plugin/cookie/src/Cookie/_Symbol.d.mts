declare const I_PARSED: unique symbol;

export declare const I: {
  readonly PARSED: typeof I_PARSED;
};

declare const $I_PARSED: unique symbol;

export declare const $I: {
  readonly PARSED: typeof $I_PARSED;
};

declare const _I_READ: unique symbol;
declare const _I_WRITE: unique symbol;
declare const _I_DEFAULTS: unique symbol;

export declare const _I: {
  readonly READ: typeof _I_READ;
  readonly WRITE: typeof _I_WRITE;
  readonly DEFAULTS: typeof _I_DEFAULTS;
};
