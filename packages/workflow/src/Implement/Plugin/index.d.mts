import type * as Kit from '@produck/kit';

import type * as PluginSubject from '../../CompoundWorkflow/Plugin/index.d.mts';

/** Plugin implementation options. */
export interface Options {
  /** Plugin tag; diagnostics only. */
  tag: string;

  /**
   * Attaches capabilities; receives the workflow kit.
   *
   * @param workflowKit - Kit the plugin attaches capabilities to.
   */
  install(workflowKit: Kit.KitProvider): void;
}

/**
 * Creates a plugin class from the given implementation.
 *
 * @param options - Implementation to wrap.
 * @returns A plugin class.
 */
export declare function Plugin(options: Options): PluginSubject.Class;
