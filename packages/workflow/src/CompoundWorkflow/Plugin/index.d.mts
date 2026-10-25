import type * as Kit from '@produck/kit';

import type * as Workflow from '../index.d.mts';
import type * as _Symbol from './_Symbol.d.mts';

/**
 * Plugin: attaches capabilities (dependencies, attachments, prefix handlers) to
 * the workflow kit before finalize.
 */
declare abstract class Plugin {
  /**
   * @param workflowKit - Kit of the workflow being extended.
   * @param workflow - Workflow instance under construction.
   */
  constructor(workflowKit: Kit.KitProvider, workflow: Workflow.Abstract);

  /** Plugin tag; diagnostics and logs only. */
  static readonly tag: string;

  /** Implementation: the plugin tag. */
  static readonly [_Symbol._S.TAG]: string;

  /**
   * Implementation: the only plugin definition entry.
   *
   * @param workflowKit - Kit the plugin attaches capabilities to.
   */
  [_Symbol._I.INSTALL](workflowKit: Kit.KitProvider): void;
}

/** Shape of a plugin class, used by `mixin()`. */
export type Class = typeof Plugin;

export { Plugin as Abstract };
