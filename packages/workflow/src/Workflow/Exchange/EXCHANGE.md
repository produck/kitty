# Exchange Lifecycle Notes

## Two timelines

An Exchange has two independent termination signals:

| Signal                | Source                                   | Meaning                                |
| --------------------- | ---------------------------------------- | -------------------------------------- |
| `close` event         | dispatch `finally` block                 | workflow pipeline has returned (sync)  |
| `isFinished` (getter) | `_I.RESPONSE.IS_FINISHED()` via Deployer | response stream has been fully written |

They can arrive in either order:

- **Handler returns first**: close dispatches before the response body stream
  finishes writing. This is common with piped/async responses — the handler
  schedules work and returns, the framework drains the stream afterward.
- **Client disconnects first**: response finishes (stream closes) before the
  handler returns. The handler may still be executing expensive work that
  will be discarded because writes are guarded by `isFinished`.

## Timeout semantics

### Handler execution timeout (`config.maxExchangeTimeout`)

Guarded by: `close` event (workflow return). Measured in milliseconds and
handed to `setTimeout` as-is.

Armed at Exchange construction and disarmed by `close`. When it fires
before `close` and the response is not yet finished, the current strategy is
to answer with `503` — the exchange is declared unable to finish, and the
response gets a result instead of hanging. Frame-level event dispatch is not
yet in place; see the EventTarget hierarchy note below.

JS is single-threaded and cooperative. A `setTimeout` callback cannot
preempt a running call stack. The timeout signal is advisory: it can mark
finished and prevent further writes via existing guards, but it cannot kill
in-flight handler code. Because the clock stops at `close`, it does not cover
the response drain that may follow.

### Response write timeout (future)

Guarded by: response `finish` event (stream complete).

Not yet implemented. Will require the Request/Response EventTarget
refinement. A separate `config.responseTimeout` entry is expected.

## Request body distributor options

The request body builds one `@produck/fugue` distributor per exchange. Its
tunables are proxied by this package: a consumer reaches them through
`Configuration` and never imports fugue. The values are only recorded —
the body is the one that applies them to the distributor it builds.

- `Configuration.Tune.Xxx(workflow, value)` adjusts one entry.
- `Configuration.Get.Xxx(workflow)` reads one entry.
- The name after `tune` / `get` is the item key.

Keys are the item keys, which are also the fugue option names:

```text
MaxChunkStashByteLength
MaxTransferrerBacklogWarningByteLength
DegradeOnChunkStashFullAndDone
ForkedReadableStreamHighWaterMark
MaxChunkReaderInitializeRetryCount
ChunkReaderInitializeRetryInterval
MaxTransferrerInitializeRetryCount
TransferrerInitializeRetryInterval
MaxTransferrerDumpRetryCount
TransferrerDumpRetryInterval
MaxTransferrerDrainRetryCount
TransferrerDrainRetryInterval
```

- The defaults are fugue's own values, copied here: a consumer never reads
  fugue to learn them. One of them is derived inside fugue rather than
  fixed — `MaxTransferrerBacklogWarningByteLength` follows
  `MaxChunkStashByteLength` — and the copy is static, so both default to
  `1 << 30` here and a tuned stash length no longer drags the warning
  threshold along.
- Values are asserted when set, and fugue asserts them again when applied.
- They are applied to every distributor right after construction, so a
  change affects the exchanges created after it.
- Where they are kept: a private `WeakMap<workflow, configuration>` inside
  this package, installed at workflow construction and seeded from the
  Configuration items.
- A value that fails its item assertion is rejected at tune time.

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
