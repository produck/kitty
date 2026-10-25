declare const _I_INSTALL: unique symbol;

/** Instance-side abstract slots of the plugin. */
export declare const _I: {
  /** Installs the plugin onto the workflow kit. */
  readonly INSTALL: typeof _I_INSTALL;
};

declare const _S_TAG: unique symbol;

/** Static-side abstract slots of the plugin. */
export declare const _S: {
  /** The plugin tag. */
  readonly TAG: typeof _S_TAG;
};
