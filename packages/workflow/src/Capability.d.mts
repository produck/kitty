import type * as Kit from '@produck/kit';
import type * as net from 'node:net';

import type * as Workflow from './CompoundWorkflow/index.d.mts';
import type * as Controller from './CompoundWorkflow/WebSocketExchange/Controller/index.d.mts';
import type * as Exchange from './Workflow/Exchange/index.d.mts';
import type * as Request from './Workflow/Exchange/Request/index.d.mts';
import type * as Response from './Workflow/Exchange/Response/index.d.mts';

/**
 * Reads the owning workflow from a kit.
 *
 * @param kit - Kit to read from.
 * @returns The owning workflow.
 */
export declare function useWorkflow(kit: Kit.KitProvider): Workflow.Abstract;

/**
 * Reads the target server from a kit.
 *
 * @param kit - Kit to read from.
 * @returns The target server.
 */
export declare function useServer(kit: Kit.KitProvider): net.Server;

/**
 * Reads the current exchange from a kit.
 *
 * @param kit - Kit to read from.
 * @returns The current exchange.
 */
export declare function useExchange(kit: Kit.KitProvider): Exchange.Abstract;

/**
 * Reads the current request part from a kit.
 *
 * @param kit - Kit to read from.
 * @returns The current request part.
 */
export declare function useRequest(kit: Kit.KitProvider): Request.Abstract;

/**
 * Reads the current response part from a kit.
 *
 * @param kit - Kit to read from.
 * @returns The current response part.
 */
export declare function useResponse(kit: Kit.KitProvider): Response.Abstract;

/**
 * Reads the WebSocket controller from a kit.
 *
 * @param kit - Kit to read from.
 * @returns The WebSocket controller.
 */
export declare function useWebSocket(kit: Kit.KitProvider): Controller.Abstract;
