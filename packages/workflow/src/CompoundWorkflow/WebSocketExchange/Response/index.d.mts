import type * as Response from '../../../Workflow/Exchange/Response/index.d.mts';

/** WebSocket response: the opening record left by the handshake. */
declare class WebSocketResponse<
  Internal = object,
> extends Response.Abstract<Internal> {
  /** Always `true`; a WebSocket response never finishes through a body. */
  readonly isFinished: true;
}

export { WebSocketResponse as Abstract };
