import type * as Kit from '@produck/kit';

import type * as WorkflowSubject from '../../CompoundWorkflow/index.d.mts';

/** Compound workflow implementation options. */
export interface Options {
  /**
   * Normalizes a response body value into `{ stream, length }`.
   *
   * @param value - Raw body value supplied by the handler.
   * @returns Normalized body data.
   */
  normalizeHttpResponseBodyData(
    value: unknown,
  ): WorkflowSubject.ResponseBodyData;
}

/** Constructable workflow class produced by the factory. */
export type Class = new (
  externalKit?: Kit.KitProvider,
) => WorkflowSubject.Abstract;

/**
 * Creates a compound workflow class from the given implementation.
 *
 * @param options - Implementation to wrap.
 * @returns A constructable workflow class.
 */
export declare function CompoundWorkflow(options: Options): Class;
