# KittyWorkflow Design Conventions

## Philosophy

Kitty shares a similar core design with Koa — middleware pipeline
orchestration — but targets more complex layering and division of
labor.

In Koa, every new capability is abstracted as middleware, yet some
high-frequency features remain hardcoded (e.g. response body detection
and content negotiation). These work well for common scenarios, but
become constraining when the pipeline needs to diverge — WebSocket
passthrough, custom upload handling, or protocol-specific
optimisations. There is no clean way to strip unwanted built-in
behaviour.

Kitty addresses this by treating features as **composable building
blocks**: capabilities are added to the pipeline in an orderly,
predictable, and observable way. Nothing is hardcoded — every feature
must be explicitly composed, and every layer has a well-defined
boundary (Kit → Workflow → Deployment → Transaction). This makes the
system adaptable to scenarios Koa's monolithic middleware model
handles poorly, while keeping the core simple and the extension path
clear.

`KittyWorkflow` is the central design object for orchestrating HTTP
server handlers under this philosophy.

## Lifecycle

```text
constructor(kit) → use(handler) → finalize()
  → deploy(server) / adapt(options)
  → (request) → TransactionKit
```

- **Construction**: Injects the `KitWorkflow` kit instance, freezes the
  object.
- **Orchestration**: Registers middleware handlers via `use()`,
  supports chaining.
- **Finalization**: `finalize()` composes the registered handler
  sequence into a single workflow. After this, `use()` is no longer
  allowed.
- **Deployment**:
  - `deploy(server)` — **auto-discovery path**: Pass an existing HTTP
    server instance. The matching adapter (constructor → installer
    mapping) is looked up from the global registry by traversing the
    server's prototype chain.
  - `adapt(options)()` — **ephemeral custom path**: Pass an options
    object (`constructor` + `install`) to get a `deployOnce`
    function, then invoke it immediately. No global registry
    registration occurs. Designed for one-off custom servers that
    cannot or should not be registered in the auto-discovery
    registry.
- **Return value**: Both `deploy()` and `adapt()()` resolve to the
  `server` instance itself. No management object is returned — the
  server's lifecycle is wholly owned by the caller (see [Server
  Lifecycle Ownership](#server-lifecycle-ownership)).

## Kit Hierarchy

When a `KittyWorkflow` is constructed, it derives a child kit from
the user-supplied kit to scope its own context. Deployment further
creates a deployment-level child kit. The inheritance chain:

```mermaid
classDiagram
  class ExternalKit {
    User-supplied kit
    Typically Kit.global
    Can carry custom deps
  }
  class KitWorkflow {
    Workflow-level scope
    kit('KitWorkflow')
    Handlers receive this kit
  }
  class DeploymentKit {
    Deployment-level scope
    kit('Kitty&lt;Deployment&gt;')
    Adapter recipe targets here
  }
  class TransactionKit {
    Per-request scope
    Created per HTTP transaction
    Provides req-res context
  }
  class HandlerKit {
    Handler-level scope
    Optional, derived by handlers
    For sub-capability isolation
  }

  ExternalKit <|-- KitWorkflow
  KitWorkflow <|-- DeploymentKit
  DeploymentKit <|-- TransactionKit
  TransactionKit <|-- HandlerKit
```

- **External kit**: Passed to `constructor(kit)`. Defaults to
  `Kit.global`, but callers can supply a custom kit pre-loaded with
  specialized dependencies and services for the workflow's runtime
  environment.
- **`KitWorkflow`**: Derived from the external kit via
  `kit('KitWorkflow')`. This is the kit seen by workflow handlers.
  Its injector (`this[I_INJECTOR]`) is cached for internal use.
- **`Kitty<Deployment>`**: Derived from `KitWorkflow` at deploy time
  via `kit('Kitty<Deployment>')`. The adapter's recipe is bound to
  this kit — the adapter never touches the Workflow-level kit.
- **TransactionKit** (conceptual): Derived from `Kitty<Deployment>`
  per-request when a request arrives. Provides transaction-scoped
  context including request/response APIs (`Method`, `URL`, `Status`,
  `Request`, `Response`, etc.). Created and disposed per HTTP
  transaction.
- **HandlerKit** (conceptual, optional): Any handler inside the
  Transaction phase may further derive a child kit for sub-capability
  isolation. This is entirely at the handler's discretion — the
  framework does not mandate or limit the depth of derivation. This
  enables features to be composed as **building blocks** at the
  handler level, not just at the framework level.

## Plugin

A Plugin is a **capability installer** for a `KittyWorkflow` instance.
Unlike a Handler (which processes requests), a Plugin installs
dependencies onto various kit levels. It is the building block for
composing features in an orderly, predictable way.

### Plugin shape

```js
workflow.plugin({
  install:       Kit.defineRecipe(kit => { ... }),   // → KitWorkflow
  onDeploy:      Kit.defineRecipe(kit => { ... }),   // → DeploymentKit
  onTransaction: Kit.defineRecipe(kit => { ... }),   // → TransactionKit
});
```

All three hooks are optional Kit recipes. A plugin provides only the
hooks it needs.

### Design notes on kit layering

1. **No lazy installation**: Kit is designed as "not installed, not
   available". If a capability is needed, install it explicitly on the
   target kit layer. There is no lazy/proxy mechanism — the cost of
   `onTransaction` recipes is simply installing function references,
   not executing business logic.
2. **Asymmetric cross-layer access**: A child kit inherits capabilities
   from its parent (e.g. TransactionKit can access DeploymentKit's
   APIs), but a parent kit **cannot** reach into a child kit's context.
   This is a feature that enforces layer boundaries — DeploymentKit
   definitions cannot depend on TransactionKit-level data.
3. **Explicit composition**: Knowing a kit has a capability is
   sufficient to use it (`kit.get(...)`). No dynamic discovery or
   runtime injection is needed.

### Hook execution timing

| Hook            | Trigger                                | Target kit       | Purpose                                     |
| --------------- | -------------------------------------- | ---------------- | ------------------------------------------- |
| `install`       | `plugin()` called, before `finalize()` | `KitWorkflow`    | Workflow-level deps, register handlers      |
| `onDeploy`      | `deploy()` / `deployOnce()`            | `DeploymentKit`  | Extend adapter's low-level API              |
| `onTransaction` | Per HTTP request                       | `TransactionKit` | Per-request context (cookie, body, session) |

### Execution order at deploy

```text
1. Create DeploymentKit
2. Adapter.install → installs low-level protocol API
3. Plugin.onDeploy hooks → extend with higher-level capabilities
4. Start server
```

### Relationship with Adapter

Adapter provides the **low-level protocol API** on `DeploymentKit`
(e.g. raw header access, stream read/write). Plugin's `onDeploy` hook
builds higher-level abstractions on top (e.g. cookie parser wraps
header read/write, body parser wraps stream). Adapters stay lean;
plugins provide composable extensions.

### Relationship with `use()`

`use(handler)` is conceptually a lightweight anonymous plugin that
only provides an `onTransaction` hook:

```js
// These are equivalent:
workflow.use((kit, next) => { ... });
workflow.plugin({ onTransaction: Kit.defineRecipe(kit => { ... }) });
```

This keeps the model uniform — `use()` is just syntactic sugar for
the most common case.

## Typed Capability Accessors

Kit provides `Getter`, a small utility that wraps a property lookup
into a typed accessor function:

```js
import { Getter } from '@produck/kit';

// Returns { use: fn, touch: fn }
const { use, touch } = Getter('body');
```

### Recommended export pattern

Each plugin or adapter package exports its Getter with a semantic
name, controlling the strictness its consumers experience:

```js
// packages/kitty-body/src/accessors.mjs
import { Getter } from '@produck/kit';

// Only export `use` — consumers must ensure the capability is
// installed, or get an immediate ReferenceError at runtime.
export const { use: useBody } = Getter('body');
export const { use: useJson } = Getter('body:json');

// packages/kitty-cookie/src/accessors.mjs
import { Getter } from '@produck/kit';

export const { use: useCookie } = Getter('cookie');
```

### Symbol keys

Kit accepts `Symbol` as a property key, which brings additional
benefits over plain strings when used for internal capability keys:

```js
// Internal symbol — not exported
const K_COOKIE = Symbol('cookie');

// Plugin installs under the symbol
kit[K_COOKIE] = { parse, serialize };

// Getter wraps the symbol
export const { use: useCookie } = Getter(K_COOKIE);
```

Advantages of Symbol keys:

- **Collision-free**: Two plugins can never accidentally use the same
  key name, even if they coincidentally choose the same description.
- **Consumer-proof**: Consumers cannot construct the Symbol from
  outside the module — they **must** use the exported accessor. This
  prevents bypass patterns like `kit['cookie']` and ensures all
  capability access goes through the intended typed accessor.
- **Debugging aid**: The Symbol's description (`Symbol(cookie)`)
  appears in stack traces and error messages, giving readable hints
  without exposing the internal key as a magic string.

(The Kit Proxy already prevents capability discovery via enumeration
— `ownKeys` and `enumerate` traps are not provided. Consumers must
"know it's installed, so they can use it". Symbol keys reinforce this
contract at the module boundary.)

Consumer usage:

```js
import { useBody } from '@produck/kitty-body';
import { useCookie } from '@produck/kitty-cookie';

// TypeScript: body is inferred as Body — no `?` needed
// Runtime:   throws immediately if body plugin is missing
const body = useBody(kit);
const cookie = useCookie(kit);
```

### Strict vs tolerant access

|           | `use(kit)`                                           | `touch(kit)`                                              |
| --------- | ---------------------------------------------------- | --------------------------------------------------------- |
| Behaviour | Throws `ReferenceError` if key not found             | Returns `undefined` if key not found                      |
| Export    | Public, the primary API                              | Internal or unexported; if not exported, rots away via GC |
| Use case  | Production code, where missing deps should fail fast | Migration, optional features, probing                     |

The accessor author decides what to export. `touch` can be kept
internal for the plugin's own optional probing, while consumers only
see `use` — guaranteeing they either get the capability or fail
immediately.

### Comparison with Koa

|                     | Koa `ctx.body`                                           | Kitty `useBody(kit)`                                      |
| ------------------- | -------------------------------------------------------- | --------------------------------------------------------- |
| Type safety         | `ctx.body?` (may not exist, TS needs augmentation)       | `Body` (guaranteed, or throws)                            |
| Runtime feedback    | Silent `undefined`                                       | Immediate `ReferenceError` with kit chain trace           |
| Dependency tracking | Implicit — no way to know which middleware provides what | Explicit — import statement makes dependency visible      |
| Composability       | All middleware share one flat `ctx`                      | Each capability is a separate import, composed explicitly |

This pattern is the counterpart to `"not installed, not available"`:
consumers also declare their dependencies by importing the
corresponding accessor — making the capability graph visible in both
directions.

## Performance Considerations

Kit was originally designed as a **cold-path facility assembly layer**
— a scaffolding for runtime bootstrapping that installs tooling
objects once or a few times during startup. After startup, those
objects are destructured into constants above hot business code and
cached. Since Kit property access was not on the hot path, JIT
optimisation was not a concern.

Kitty extends Kit's role into **hot-path (per-request) territory**
via `onTransaction` hooks.

### Actual cost model

Kit uses **Proxy + plain object** (`Object.create(null)`), not a Map:

- Property access (`kit.cookies`) goes through a Proxy `get` trap.
- On **happy path** (property found in local dependencies), the trap
  checks `property in dependencies` and returns immediately — a fast
  constant-time operation.
- On **miss** (property not local), it recurses up the parent chain
  via `parent[property]` — O(D) where D is the chain depth (typical
  4–5 layers; with nested containers up to 9–10).
- Property assignment (`kit.cookies = value`) goes through Proxy
  `set` trap — validates uniqueness and writes to the local
  dependencies object.

The cost of 20 `onTransaction` recipes (each with ~3 `kit.set()`
calls) plus handler-time property accesses via Proxy is estimated at
~20μs per request — negligible alongside typical I/O (5–100ms).

### JIT optimisation potential

Since dependencies are stored as **fixed named properties** on a
plain object (not Map entries), V8 can generate hidden classes. If
`onTransaction` recipes consistently set the same set of properties
in the same order across requests, the shape stabilises and Proxy
`get` can be JIT-optimised as monomorphic.

### Recommended access pattern

Direct `kit.property` access is available, but the recommended
pattern is using `Injector.bind(recipe)`:

```js
// Recommended: bound recipe receives kit as first arg
const handler = injector.bind((kit, args) => {
  // kit is pre-injected — no Proxy traversal needed at call site
});
```

`use` (bound recipe) ensures dependencies are explicit and correct,
especially when handlers are composed via `Composer.compose()` —
where the onion-shaped control flow reduces observability of
implicit kit lookups. The `touch` API exists but `use` is preferred
for production code.

### Mitigations in recipe design

- Keep `onTransaction` recipes lean: only install getters / method
  references, never pre-compute values.
- Minimise the number of `kit.set()` calls per recipe — batch related
  capabilities into fewer installs (namespace bundling).
- Limit N (total plugins with `onTransaction`) to a reasonable
  ceiling (typical production applications: 3–8).

### When it matters

For most real-world workloads (API servers, SSR, database-backed
apps), the handler's own I/O and business logic dominate the latency
budget — Kit's per-request overhead is negligible.

This becomes a genuine concern only in **ultra-low-latency hot paths**
such as reverse proxies, request routers, or transparent gateways
where handler logic itself is near-zero. For those scenarios,
avoiding `onTransaction` and accessing DeploymentKit-level utilities
directly from handlers is the recommended escape hatch.

### Mitigations in recipe packaging

A practical way to reduce `kit.set()` calls without changing the Kit
API is **namespace bundling**: group related capabilities under a
single key rather than installing them individually.

```js
// Instead of:
kit.set('cookies', cookies);
kit.set('session', session);
kit.set('body', bodyParser);

// Bundle under a namespace:
kit.set('http', { cookies, session, bodyParser });
// Or: kit.set('@cookie', { parse, serialize });
```

Benefits:

- **Fewer `kit.set()` calls** — each recipe installs 2–3 namespaces
  instead of 10+ individual entries, reducing hidden class transitions
  on the Kit store.
- **Cleaner Kit surface** — consumers find related capabilities under
  a predictable key instead of scanning flat keys.
- **Reusability** — a namespace bundle can be shared across recipes
  and layers.

The per-request overhead of 20 `onTransaction` recipes is estimated
at ~20μs. Compared against typical handler I/O (5–100ms), this is
<0.5% of total latency — acceptable for the vast majority of use
cases.

### Value proposition

Even with the per-request overhead, Kit's scope chain provides
significant advantages that justify the cost:

- **Predictable capability visibility**: A handler receives exactly
  the kit its layer provides — no surprise prototypes or implicit
  globals.
- **Defence in depth**: Capabilities must be explicitly installed
  before use. "Not installed, not available" prevents accidental
  leakage of cross-layer state.
- **Readability**: The scope chain makes it clear where each
  capability comes from — `kit.get('http')` vs `this.something` on a
  flat context.
- **Adaptive composition**: Adding or removing a plugin changes the
  capability set uniformly across all handlers in the workflow,
  without touching handler code.

These properties make the O(N) per-request installation a worthwhile
tradeoff for codebases that value predictability and composability
over raw throughput.

## Governance

- `plugin()` must be called before `finalize()`. After finalization,
  no more plugins can be added.
- Plugins are installed **immediately** at `plugin()` call time (for
  `install` hook). No deferral queue.
- Plugin dependency negotiation is the plugins' own responsibility —
  the framework does not define or enforce dependency ordering.

## Adapter/Workflow Bridge Protocol

The `handleTransaction` function in `Deployment.mjs` is the sole bridge
between the Adapter layer (protocol-specific, knows server type) and
the Workflow layer (application logic, server-agnostic).

### Contract

```text
Adapter recipe: (DeploymentKit, [handle]) => void
handle:         (TransactionKit) => Promise<unknown>
```

- **Adapter recipe** receives `DeploymentKit` and a `handle` callback.
  It must:
  1. Extract the server from `DeploymentKit` via `useDeployment(kit)`.
  2. Attach protocol-specific listeners to the server
     (`server.on('request', ...)`, `server.on('stream', ...)`, etc.).
  3. On each incoming transaction, derive a `TransactionKit` from
     `DeploymentKit` and invoke `handle(TransactionKit)`.
- **handle** receives a `TransactionKit` and executes the workflow
  middleware pipeline against it. The Adapter awaits or ignores the
  returned promise depending on protocol semantics (HTTP/1.x typically
  awaits the response; HTTP/2 may handle concurrent streams).

### Protocol invariant

The Adapter **must not** assume anything about the Workflow layer:

- It does not know what handlers are registered via `use()`.
- It does not know what plugins are installed.
- It does not interact with the `KitWorkflow` kit — only with
  `DeploymentKit` and `TransactionKit`.

The Workflow layer **must not** assume anything about the transport:

- It does not know whether the server is HTTP/1.1, HTTP/2, or a custom
  protocol.
- It does not know the server's event model.
- It interacts only with capabilities installed on its kit.

### Motivation

Different server types expose fundamentally different event models:

| Server type    | Key events                            |
| -------------- | ------------------------------------- |
| `http.Server`  | `request`, `upgrade`, `checkContinue` |
| `http2.Server` | `session`, `stream`, `goaway`         |
| `net.Server`   | `connection`, `close`                 |

A unified lifecycle management object at the Workflow level would
either need to abstract all these into a lowest-common-denominator
interface (losing type-specific capabilities) or leak server-type
knowledge into Workflow. The Bridge Protocol avoids both by keeping
the Adapter as the sole owner of protocol semantics.

### Deployment flow

```text
deploy(server) / deployOnce(server)
  │
  ├─ 1. Create DeploymentKit from KitWorkflow
  ├─ 2. Store { server, options } on DeploymentKit (Symbol-keyed)
  ├─ 3. Injector.bind(install)(handleTransaction)
  │       │
  │       └─ Adapter recipe executes:
  │            • Reads server via useDeployment(DeploymentKit)
  │            • Attaches listeners
  │            • Per transaction: creates TransactionKit,
  │              calls handle(TransactionKit)
  │
  └─ 4. Returns server (not a management wrapper)
```

This flow is identical for both `deploy()` and `adapt()` — the only
difference is how the `install` recipe is sourced (global registry
vs. inline options).

### Protocol correctness is the Adapter author's responsibility

The Bridge Protocol is a **documented contract**, not a machine-enforced
constraint. Workflow cannot verify at definition time that an Adapter
recipe calls `handle` in the right place, or calls it at all — that is
a runtime behaviour that only emerges when the server processes actual
requests.

Workflow does not provide test helpers for this verification. The
Adapter author chooses their own method to prove correctness (unit
tests, integration tests, manual verification, etc.). This is
consistent with the project's MIT licensing philosophy — the framework
defines the protocol; adapter authors are responsible for their own
implementations.

Downstream consumers (application developers) select an Adapter based
on trust or demonstrated quality. If an Adapter fails to call `handle`,
the symptom is clear at runtime (requests hang or error), and the
consumer can switch to a different Adapter.

### Transaction Template

A Transaction Template defines the standard capability set that every
`TransactionKit` must provide (e.g. `Method`, `URL`, `Status`,
`Request`, `Response` — the protocol-agnostic request/response
abstractions analogous to Koa's `ctx`).

**Design decision**: The Transaction Template lives in the `workflow`
core package, not as an independent sub-package.

Rationale:

1. **Core contract, not optional plugin**: The Transaction Template is
   part of the communication protocol between Workflow and Adapter —
   every Adapter must provide a `TransactionKit` that satisfies it.
   Making it independent would require every Adapter author to
   manually import and compose it, adding friction with no benefit.

2. **Implicit registration via import side effect**: Adapters register
   themselves into the global Adapter registry as a side effect of
   being imported. Since the Transaction Template is in the same core
   package, downstream users get both in one import — no separate
   registration step:

   ```js
   import '@produck/kitty-adapt-http';
   // Adapter registered, Transaction Template available — done.
   ```

3. **Workflow guarantees template installation**: `[I_DEPLOY]`
   composes the Transaction Template installer with the Adapter's
   own installer, ensuring the template is always present on every
   `TransactionKit` without the Adapter author needing to know about
   it:

   ```js
   async [I_DEPLOY](install, server, options) {
     const runtime = Kit.compose(
       TransactionTemplateInstaller,  // workflow core
       install,                       // adapter-specific
     );
     // ...
   }
   ```

   The Adapter only needs to provide protocol-specific capabilities
   (raw `req`/`res` objects, socket handles, etc.). The standard
   request/response abstractions are automatically in place.

This keeps the Adapter author's surface area minimal while ensuring
consistency across all Adapters.

## Server Lifecycle Ownership

The server passed to `deploy()` / `deployOnce()` remains under the
caller's control at all times. Workflow does not:

- Start or stop the server.
- Track active connections or transactions.
- Expose a management handle for lifecycle operations.

### Rationale

1. **Server is caller-owned**: The caller constructed or acquired the
   server before passing it in. It can (and should) manage
   `server.listen()`, `server.close()`, error handling, and address
   queries directly.

2. **Protocol diversity**: Different server types have different
   lifecycle semantics (e.g., HTTP/2 has session lifecycle, HTTP/1.1
   has keep-alive). A Workflow-level abstraction would either be too
   thin to be useful or too leaky to be clean.

3. **Separation of concerns**: "How to close a server" is an Adapter
   concern; "what to do with each request" is a Workflow concern.
   Mixing them in a single return value conflates the two layers.

### What the caller controls

```js
const server = http.createServer();
const app = new Kitty.Workflow(kit);

app.finalize();
await app.deploy(server); // attaches middleware, does NOT listen
server.listen(3000); // caller starts accepting

// Later:
server.close(); // caller stops accepting
```

### Graceful shutdown

Since Workflow does not track active transactions, a graceful shutdown
requires the caller to coordinate at the server level:

```js
server.close(async () => {
  // All connections drained.
  // Workflow handlers are no longer invoked.
});
```

For more sophisticated draining (e.g., waiting for in-flight
TransactionKit promises), the Adapter recipe can expose a drain
capability on `DeploymentKit`:

```js
// Adapter recipe:
kit.set('drain', async () => {
  // Wait for all tracked TransactionKit promises
  await Promise.all(activeTransactions);
});
```

This stays at the Adapter level — Workflow never needs to know about
it.

## Event & Cross-Cutting Concerns

Kitty does not provide a built-in event bus, pub/sub mechanism, or
application-level hook system. These are **user-managed
cross-cutting concerns** placed in the ExternalKit.

### Pattern

1. **User** constructs an ExternalKit with the desired event/capability
   infrastructure:

   ```js
   import { EventEmitter } from 'node:events';
   import * as Kit from '@produck/kit';

   const EVENT_BUS = Symbol('app.eventBus');
   const kit = Kit.derive(Kit.global, (parent) => {
     parent.set(EVENT_BUS, new EventEmitter());
   });
   ```

2. **User** passes it to `KittyWorkflow`:

   ```js
   const app = new Kitty.Workflow(kit);
   ```

3. **External code** subscribes via the same kit:

   ```js
   kit.get(EVENT_BUS).on('user.login', data => { ... });
   ```

4. **Business handler** accesses the bus via the kit inheritance chain
   (ExternalKit → KitWorkflow → DeploymentKit → TransactionKit):

   ```js
   // Inside a handler registered via use():
   function handler(TransactionKit, next) {
     TransactionKit.get(EVENT_BUS).emit('user.login', { userId });
     return next();
   }
   ```

### Why not built-in

- **Type diversity**: Users may want `EventEmitter`, `EventTarget`,
  Redis pub/sub, or a custom message bus. Workflow should not mandate
  one.
- **Zero-dependency principle**: Adding built-in events would make
  Kitty depend on `node:events` even for users who do not need events.
- **Kit is already the extension channel**: The ExternalKit user
  provides at construction time serves as the natural carrier for
  cross-cutting concerns. No additional framework concepts needed.
- **Consistency**: If events are just another kit capability, they
  follow the same "not installed, not available" contract as
  everything else — no special treatment.

### What this means for handleTransaction

The `handleTransaction` bridge does not need to wire up events.
Events flow through the kit chain automatically: anything installed
on ExternalKit is reachable from TransactionKit. The Adapter recipe
does not need to propagate events — it only creates the
TransactionKit, and kit inheritance does the rest.

## Design Constraints

### 1. Immutability & Freezing

- `Object.freeze(this)` is called immediately after construction —
  instance properties are immutable.
- After `finalize()`, the handler sequence is `Object.freeze()`'d — no
  more handlers can be added.

### 2. State Guards

- `isFinal` guard: `finalize()` / `deploy()` / `adapt()` all check
  whether the workflow has already been finalized. Repeated calls
  throw.
- The `deployOnce` function returned by `adapt()` **must be called
  synchronously and exactly once**, enforced via `queueMicrotask`.
  Rationale: since `deployOnce` bypasses the global Adapter registry
  and couples directly to a custom installer, it must be consumed
  immediately at the call site — deferring or storing it risks
  inconsistent or orphaned state:

  ```js
  let deployed = false,
    available = true;
  queueMicrotask(() => (available = false));

  return function deployOnce(server, options) {
    if (!available) {
      /* not called immediately */
    }
    if (deployed) {
      /* already deployed */
    }
    deployed = true;
    // ...validation, deployment...
  };
  ```

  - `available` uses the microtask queue to guard the synchronous call
    window: calling within the same tick passes, calling later is
    rejected.
  - `deployed` is set before validation completes, ensuring only the
    first call proceeds past the guard.

### 3. Handler Signature

Handlers registered via `use()` must be functions with an arity of 2
or less:

```js
handler: ([kit[, next]]) => any
```

- Handlers with `length > 2` are rejected.

### 4. Deployment Paths

Two deployment paths serve different scenarios:

- **Discovery**
  - `deploy()`: Reverse lookup via Adapter registry (`Adapter.getByServer`).
  - `adapt()()`: Explicit `options.constructor`, checked via `instanceof`.
- **Registry**
  - `deploy()`: Relies on global registry of constructor → installer
    mappings, pre-populated by Kitty official adapters.
  - `adapt()()`: No global registration — ephemeral, one-off usage.
- **Use case**
  - `deploy()`: Standard server instances where the matching adapter is already
    registered.
  - `adapt()()`: Custom server variants not covered by official adapters, or when
    the user does not want to pollute the auto-discovery registry (e.g. a
    constructor slot is already occupied and cannot be overridden).
- **Reusability**
  - `deploy()`: Unlimited — can be called multiple times with different servers.
  - `adapt()()`: Once only — `deployOnce` rejects repeated calls.
- **Timing**
  - `deploy()`: No constraint.
  - `adapt()()`: Must be called synchronously within the same tick as `adapt()`.

### 5. Deployment Injection

Each adapter defines an `install` via `Kit.defineRecipe()` — a **Kit
recipe** that installs dependencies onto the deployment-level kit
(`Kitty<Deployment>`). The adapter concerns itself only with this
kit; it has no access to or effect on the Workflow-level kit
(`KitWorkflow`).

Deployment executes via
`Kit.Injector(kit).bind(install)(server, options)`, which binds the
recipe to the deployment kit and invokes it with `(server, options)`.

The `install` source varies by path:

- `deploy()`: fetched from the global Adapter registry.
- `adapt()`: provided directly in the `options` argument.

The internal `deploy` function is module-private and not exposed
externally.

## Glossary

- **Workflow**: The composed handler pipeline, produced by
  `Composer.compose()`.
- **Adapter**: A mapping between a server constructor and its
  installer. Works only on the deployment-level kit
  (`Kitty<Deployment>`); has no effect on the Workflow-level kit.
- **Kit Recipe**: Describes dependencies to install into a kit.
  Adapter `install` is a recipe defined via `Kit.defineRecipe()`.
- **deploy**: Auto-discovery deployment — looks up installer from
  global Adapter registry by prototype chain.
- **adapt**: Ephemeral custom deployment — no global registration,
  one-off use with immediate invocation guard.|
