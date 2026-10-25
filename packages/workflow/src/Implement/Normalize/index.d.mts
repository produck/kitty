import type * as CompoundWorkflow from '../CompoundWorkflow/index.d.mts';
import type * as DeployerSubject from '../Deployer/index.d.mts';
import type * as ExchangeSubject from '../Exchange/index.d.mts';
import type * as PluginSubject from '../Plugin/index.d.mts';

/** Normalizes compound workflow implementation options. */
export declare function Workflow(
  options: CompoundWorkflow.Options,
): CompoundWorkflow.Options;

/** Normalizes deployer implementation options. */
export declare function Deployer(
  options: DeployerSubject.Options,
): DeployerSubject.Options;

/** Normalizes plugin implementation options. */
export declare function Plugin(
  options: PluginSubject.Options,
): PluginSubject.Options;

/** Normalizes exchange implementation options, per protocol. */
export declare const Exchange: Readonly<{
  /** Normalizes the protocol-agnostic base ports. */
  Base(options: ExchangeSubject.BaseOptions): ExchangeSubject.BaseOptions;

  /** Normalizes the HTTP exchange ports. */
  Http(options: ExchangeSubject.HttpOptions): ExchangeSubject.HttpOptions;

  /** Normalizes the WebSocket exchange ports. */
  WebSocket(
    options: ExchangeSubject.WebSocketOptions,
  ): ExchangeSubject.WebSocketOptions;
}>;
