import type * as Kit from '@produck/kit';

import type * as Workflow from '../index.d.mts';
import type * as _Symbol from './_Symbol.d.mts';

/** Attacher invoked once with each DeploymentKit. */
export interface DeploymentAttacher {
  /**
   * @param deploymentKit - Kit of the deployment being linked.
   */
  (deploymentKit: Kit.KitProvider): void;
}

/** Attacher invoked once with each ExchangeKit at request time. */
export interface ExchangeAttacher {
  /**
   * @param exchangeKit - Kit of the exchange being served.
   */
  (exchangeKit: Kit.KitProvider): void;
}

/** Kit the plugin attaches its capabilities through. */
export interface PluginKit extends Kit.KitProvider {
  /** Attaches a named value to the workflow kit, before finalize. */
  attachWorkflow(name: string, value: unknown): void;

  /** Registers an attacher invoked with each DeploymentKit. */
  appendDeploymentAttacher(attacher: DeploymentAttacher): void;

  /** Registers an attacher invoked with each ExchangeKit at request time. */
  appendExchangeAttacher(attacher: ExchangeAttacher): void;

  /** Prepends handlers to the pipeline. */
  appendPrefixHandler(...handlerList: Workflow.Handler[]): void;
}

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
  [_Symbol._I.INSTALL](workflowKit: PluginKit): void;
}

/** Shape of a plugin class, used by `withPlugin()`. */
export type Class = typeof Plugin;

export { Plugin as Abstract };
