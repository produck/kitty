import type * as Kit from '@produck/kit';
import type * as net from 'node:net';

import type * as Deployment from '../../Workflow/Deployment/index.d.mts';
import type * as HttpExchange from '../HttpExchange/index.d.mts';
import type * as WebSocketExchange from '../WebSocketExchange/index.d.mts';
import type * as _Symbol from './_Symbol.d.mts';

/** Kit the deployer writes its deployment definition through. */
export interface DeployerKit extends Kit.KitProvider {
  /** Declares a named manifest entry for the compile path. */
  declare(name: string, value: unknown): void;

  /** Pushes a server linker; linkers run LIFO when the deployment links. */
  setServerLinker(
    link: (context: unknown, next: () => unknown) => unknown,
  ): void;

  /** Registers an attacher invoked with each ExchangeKit at request time. */
  appendExchangeAttacher(
    attacher: (ExchangeKit: Kit.KitProvider) => void,
  ): void;

  /** Attaches a value to the deployment kit under the given name. */
  attachDeployment(name: string, value: unknown): void;

  /** Dispatches one HTTP exchange. */
  handleHttpExchange(internal: unknown): Promise<void>;

  /** Dispatches one WebSocket exchange. */
  handleWebSocketExchange(internal: unknown): Promise<void>;
}

/**
 * Deployer: instance-level abstraction; one instance serves one deployment.
 * The kit passed to the constructor is the only channel into the deployment.
 */
declare abstract class Deployer {
  /**
   * @param deploymentKit - Kit holding this deployment.
   * @param deployment - Deployment being built.
   */
  constructor(deploymentKit: Kit.KitProvider, deployment: Deployment.Concrete);

  /** Deployer tag; diagnostics and logs only. */
  static readonly tag: string;

  /** Implementation: the deployer tag. */
  static readonly [_Symbol._S.TAG]: string;

  /** Implementation: target server constructor; also the registry key. */
  static readonly [_Symbol._S.SERVER_CTOR]: abstract new (
    ...args: never[]
  ) => net.Server;

  /** Implementation: HTTP exchange constructor (required). */
  static readonly [_Symbol._S.EXCHANGE_CTOR.HTTP]: abstract new (
    ...args: never[]
  ) => HttpExchange.Abstract;

  /** Implementation: WebSocket exchange constructor; `undefined` if unsupported. */
  static readonly [_Symbol._S.EXCHANGE_CTOR.WEB_SOCKET]:
    (abstract new (...args: never[]) => WebSocketExchange.Abstract) | undefined;

  /**
   * Implementation: the only deployment definition entry.
   *
   * @param deployerKit - Kit the deployer writes its definitions into.
   */
  [_Symbol._I.INSTALL](deployerKit: DeployerKit): void;
}

/** Shape of a deployer class, used by the registry and `withDeployer()`. */
export type Class = typeof Deployer;

export { Deployer as Abstract };
