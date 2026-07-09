# Exchange Lifecycle Notes

## Two timelines

An Exchange has two independent termination signals:

| Signal                | Source                                  | Meaning                                |
| --------------------- | --------------------------------------- | -------------------------------------- |
| `close` event         | `handleExchange` finally block          | workflow pipeline has returned (sync)  |
| `isFinished` (getter) | `_I.RESPONSE.IS_FINISHED()` via Adapter | response stream has been fully written |

They can arrive in either order:

- **Handler returns first**: close dispatches before the response body stream
  finishes writing. This is common with piped/async responses — the handler
  schedules work and returns, the framework drains the stream afterward.
- **Client disconnects first**: response finishes (stream closes) before the
  handler returns. The handler may still be executing expensive work that
  will be discarded because writes are guarded by `isFinished`.

## Timeout semantics

### Handler execution timeout (`config.timeout`)

Guarded by: `close` event (workflow return).

When the timeout fires before `close`, the current strategy is to dispatch a
`timeout` event on the Exchange. Handlers that care about timeout may listen
and take action (e.g., `setStatus(504)`). Frame-level auto-503 is
intentionally avoided — the handler owns the response semantics.

JS is single-threaded and cooperative. A `setTimeout` callback cannot
preempt a running call stack. The timeout signal is advisory: it can mark
finished and prevent further writes via existing guards, but it cannot kill
in-flight handler code.

### Response write timeout (future)

Guarded by: response `finish` event (stream complete).

Not yet implemented. Will require the Request/Response EventTarget
refinement. A separate `config.responseTimeout` entry is expected.

## Handler awareness

A handler that performs async follow-up work (e.g., `.then()` on a response
body, or its own timers) does not need to distinguish between "workflow
ended" and "response finished". Checking `exchange.isFinished` is sufficient —
writes are rejected once finished, regardless of which timeline triggered it.

## EventTarget hierarchy (future)

KittyExchange, KittyExchangeRequest, and KittyExchangeResponse will each
extend EventTarget. Sub-object events bubble up through the Exchange:

```text
Request.consumed  → Exchange dispatches 'request-consumed'
Response.finish   → Exchange dispatches 'response-finished'
```

This enables MixIns to observe lifecycle events without polling getters.
