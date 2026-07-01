# KittyWorkflow Design Conventions

## Document Scope

DESIGN.md is the working draft for AI collaboration and exploration.
Stable conclusions should be moved into ARCHITECTURE.md.

> **AI session note**: Tests in this repository are design sandboxes,
> not hardened regression suites. Focus changes on `src/`. Do not
> expand test coverage or fix test issues unless explicitly requested.
> When source changes break tests, update only the minimal surface to
> keep the suite executable.

Deployment paths are discussed in more detail in
[DEPLOYMENT.md](DEPLOYMENT.md).

Attachment ports are discussed in more detail in
[ATTACHMENT-PORTS.md](ATTACHMENT-PORTS.md).

## Terminology: Attachment

**Attachment** is a key term in KittyWorkflow. At the kit level, it
names the act of appending a dependency or capability to a `Kit`, which
acts as the domain tracker for that part of the assembled program.

In KittyWorkflow, attachment is narrowed into a controlled structural
write. An attachment may install a workflow-static dependency, register
a deployment attacher, or register an exchange attacher. The derived
term **attacher** means a function recorded by one domain and later run
to attach dependencies into another kit scope.

The important property in workflow assembly is control. Attachment is
not arbitrary mutation of `WorkflowKit`; it is a lifecycle-guarded
structural write performed through an authorized surface. In this
vocabulary, `MixinKit` and `AdapterKit` are attachment ports:
supplier-facing facades that expose specific attachment abilities
without exposing the full workflow authority behind them.

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
boundary (Kit → Workflow → Deployment → Exchange). This makes the
system adaptable to scenarios Koa's monolithic middleware model
handles poorly, while keeping the core simple and the extension path
clear.

`KittyWorkflow` is the central design object for orchestrating HTTP
server handlers under this philosophy.

## Kit As Scope Inheritance

`@produck/kit` is best understood here as a scope-inheritance mechanism
for program assembly. It models capability distribution as inheritance
between explicit runtime scopes, rather than as parameter passing,
global registries, or call-frame context.

The tracked unit is a structural scope, not a call frame. A frame may be
where a child kit is physically created, but the design intent is to
express where a capability belongs in the assembled program:

```text
WorkflowKit -> DeploymentKit -> ExchangeKit -> Handler child kits
```

This keeps the main composition question small: which scope should own
this capability? Once installed at the right scope, the capability is
distributed downward by normal kit inheritance and can be accessed with
ordinary property syntax.

`WorkflowKit` also carries the workflow instance itself as a stable
identity capability. Downstream code may read that identity via
`useWorkflow(kit)` and use it as a `WeakMap` key, but it does not receive
direct write access to `WorkflowKit`. Structural writes remain behind
guarded attachment-port methods.

Kitty is a concrete use of this mechanism. It does not try to model all
program effects as typed computations. Instead, it uses kit inheritance
to assemble workflow, deployment, adapter, exchange, and handler
capabilities at the layers where they belong.

## Core As Authority Boundary

> Kitty core is "dividing territory and assigning authority".

This is an intuitive way to describe the core responsibility. Kitty core
does not own downstream feature grammar, but it does own the authority
model: which runtime scopes exist, which attachment ports are issued,
which structural writes are allowed, and when those writes expire.

In engineering terms, core is responsible for:

- dividing the kit hierarchy into workflow, deployment, adapter,
  exchange, and handler scopes;
- owning the workflow assembly surface and granting attachment ports
  such as `MixinKit` and `AdapterKit` as facades to that surface;
- keeping structural writes behind guarded methods;
- defining lifecycle windows such as finalization, deployment artifact
  construction, and per-exchange runtime scope;
- exposing workflow identity without exposing the writable
  `WorkflowKit` surface.

Downstream suppliers own feature grammar and runtime policy. Handler
authors consume inherited capabilities. Core's job is to keep those
roles from accidentally receiving each other's authority.

### Workflow Assembly Surface

The stable source of structural attachment authority is the workflow
assembly surface. It is owned by `WorkflowKit`, not independently by each
supplier-facing kit.

The assembly surface consists of three controlled capability classes,
distributed across the supplier-facing kits that own each attachment
phase:

- **Workflow-static dependencies**: attached via `attachWorkflow(key, value)`.
  Available on `WorkflowKit` and inherited by all downstream kits.
  Exposed through `MixinKit` as a facade.
- **Deployment attachers**: functions recorded during the installation
  phase and run during compile-time `DeploymentKit` preparation. Exposed
  through `MixinKit` only — AdapterKit provides direct `DeploymentKit`
  writes via `attachDeployment(key, value)`.
- **Exchange attachers**: functions recorded during the installation or
  compile phase and run when an `ExchangeKit` is prepared. Exposed
  through both `MixinKit` and `AdapterKit`, each with its own lifecycle
  window.

`MixinKit` and `AdapterKit` are supplier-facing facades over subsets of
the workflow assembly surface. Each port exposes only the abilities
relevant to its role and lifecycle phase. After `finalize()`, structural
additions to the assembly surface are closed.

## Architecture Overview

> Stable description moved to [ARCHITECTURE.md](ARCHITECTURE.md#architecture-layering).

## Lifecycle

> Stable description moved to [ARCHITECTURE.md](ARCHITECTURE.md#lifecycle).

## Mixin Domain

> Stable description moved to [ARCHITECTURE.md](ARCHITECTURE.md#mixin-domain).

### Design notes on kit layering

1. **No lazy installation**: Kit is designed as "not installed, not
   available". If a capability is needed, install it explicitly on the
   target kit layer. There is no lazy/proxy mechanism — the cost of
   `onDeploy` recipes is simply installing function references,
   not executing business logic.
2. **Asymmetric cross-layer access**: A child kit inherits capabilities
   from its parent (e.g. ExchangeKit can access DeploymentKit's
   APIs), but a parent kit **cannot** reach into a child kit's context.
   This is a feature that enforces layer boundaries — DeploymentKit
   definitions cannot depend on ExchangeKit-level data.
3. **Explicit composition**: Knowing a kit has a capability is
   sufficient to use it (`kit[key]`). No dynamic discovery or
   runtime injection is needed.

## Adapter Domain

> Stable description moved to [ARCHITECTURE.md](ARCHITECTURE.md#adapter-domain).

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
via `onExchange` hooks.

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

The cost of 20 plugin `use()` handlers (each with ~3 `set()`
calls) plus handler-time property accesses via Proxy is estimated at
~20μs per request — negligible alongside typical I/O (5–100ms).

### JIT optimisation potential

Since dependencies are stored as **fixed named properties** on a
plain object (not Map entries), V8 can generate hidden classes. If
`onExchange` recipes consistently set the same set of properties
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

- Keep `onExchange` recipes lean: only install getters / method
  references, never pre-compute values.
- Minimise the number of `set()` calls per plugin — batch related
  capabilities into fewer installs (namespace bundling).
- Limit N (total plugins with `onExchange`) to a reasonable
  ceiling (typical production applications: 3–8).

### When it matters

For most real-world workloads (API servers, SSR, database-backed
apps), the handler's own I/O and business logic dominate the latency
budget — Kit's per-request overhead is negligible.

This becomes a genuine concern only in **ultra-low-latency hot paths**
such as reverse proxies, request routers, or transparent gateways
where handler logic itself is near-zero. For those scenarios,
avoiding `onExchange` and accessing DeploymentKit-level utilities
directly from handlers is the recommended escape hatch.

### Mitigations in recipe packaging

A practical way to reduce `set()` calls without changing the Kit
API is **namespace bundling**: group related capabilities under a
single key rather than installing them individually.

```js
// Instead of:
kit['cookies'] = cookies;
kit['session'] = session;
kit['body'] = bodyParser;

// Bundle under a namespace:
kit['http'] = { cookies, session, bodyParser };
// Or: kit['@cookie'] = { parse, serialize };
```

Benefits:

- **Fewer `set()` calls** — each plugin installs 2–3 namespaces
  instead of 10+ individual entries, reducing hidden class transitions
  on the Kit store.
- **Cleaner Kit surface** — consumers find related capabilities under
  a predictable key instead of scanning flat keys.
- **Reusability** — a namespace bundle can be shared across recipes
  and layers.

The per-request overhead of 20 `onExchange` recipes is estimated
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
  capability comes from — `kit['http']` vs `this.something` on a
  flat context.
- **Adaptive composition**: Adding or removing a plugin changes the
  capability set uniformly across all handlers in the workflow,
  without touching handler code.

These properties make the O(N) per-request installation a worthwhile
tradeoff for codebases that value predictability and composability
over raw throughput.

## Governance

> Stable rules moved to [ARCHITECTURE.md](ARCHITECTURE.md#governance).

### Recommended dedup pattern

If a mixin should only be installed once, use `attachWorkflow` with a
Symbol flag:

```js
import { Getter, isKit } from '@produck/kit';

const K_INSTALLED = Symbol('my-mixin:installed');
const { touch } = Getter(K_INSTALLED);

workflow.mixin((mixinKit) => {
  if (touch(mixinKit) !== undefined) {
    throw new Error('MyMixin has already been installed.');
  }

  mixinKit.attachWorkflow(K_INSTALLED, true);
  // ... install logic ...
});
```

## Adapter/Workflow Bridge Protocol

> Stable contract, protocol invariant, guardrails, and deployment flow
> moved to [ARCHITECTURE.md](ARCHITECTURE.md#adapterworkflow-bridge-protocol).

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

### Planned: logical exchange identity getter

Current runtime guard rejects repeated dispatch of the same `Exchange`
instance. A stronger guard for logical duplicates is planned.

Direction:

- `_I.INTERNAL` remains the internal object-group surface.
- Adapter implementations should expose a separate identity-specific
  symbol/getter for logical exchange deduplication.
- The identity should represent one logical exchange in the underlying
  protocol runtime (for example req/res pair, stream, or equivalent).
- Identity consumption is enforced in Exchange construction rather than
  in `handleExchange`.

Planned binding model:

- Exchange layer validates identity object semantics at construction
  time to enforce identity-exchange strong binding.
- `handleExchange` keeps duplicate-dispatch checks to enforce
  exchange-workflow execution strong binding.

This is an adapter contract extension and remains an adapter
responsibility boundary.

### Exchange Template

> Stable description moved to [ARCHITECTURE.md](ARCHITECTURE.md#exchange-template).

**Design decision**: The Exchange Template lives in the `workflow`
core package, not as an independent sub-package.

Rationale:

1. **Core contract, not optional plugin**: The Exchange Template is
   part of the communication protocol between Workflow and Adapter —
   every Adapter must provide an `ExchangeKit` that satisfies it.
   Making it independent would require every Adapter author to
   manually import and compose it, adding friction with no benefit.

2. **Implicit registration via import side effect**: Adapters register
   themselves into the global Adapter registry as a side effect of
   being imported. Since the Exchange Template is in the same core
   package, downstream users get both in one import — no separate
   registration step:

   ```js
   import '@produck/kitty-adapt-http';
   // Adapter registered, Exchange Template available — done.
   ```

3. **Workflow guarantees template installation**: `[I_DEPLOY]`
   composes the Exchange Template installer with the Adapter's
   own installer, ensuring the template is always present on every
   `ExchangeKit` without the Adapter author needing to know about
   it:

   ```js
   async [I_DEPLOY](install, server) {
     const runtime = Kit.compose(
       ExchangeTemplateInstaller,  // workflow core
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

### Body scope

Kitty core is responsible for memory safety. The first-class body
interface is always stream-based:

```js
tx.response.body.data; // Readable | null
tx.request.body.data; // Readable | null
```

- **Readable**: Always stream. Never auto-drains to Buffer. Consumers
  pipe or read chunks as needed.
- **null**: No body.

Core may provide a default caching strategy (threshold → temp file)
with a policy controller installed on `DeploymentKit`. The
configuration entry point for that policy is still open; it is not a
generic `deploy(server, options)` pass-through.

```js
// Handler can adjust per-request via inherited policy
workflow.use(async (kit, next) => {
  const policy = kit['body.policy'];
  policy.threshold = '500MB'; // this request allows larger body
  return next();
});
```

The policy controller is accessible from `ExchangeKit` via kit
inheritance — no extra installation needed. This keeps the default
safe while allowing handlers to opt into different behavior.

This illustrates a broader design advantage: in traditional frameworks
(cache size, body limit, timeouts) are usually locked at middleware
initialization time. Changing them per-request requires awkward
workarounds or global state mutation. Kitty's `DeploymentKit` →
`ExchangeKit` inheritance chain makes per-request policy
adjustment a natural pattern — the controller is installed once and
inherited by every request, and handlers can tune it without
affecting others.

Buffer-style convenience (`body.json()`, `body.text()`, etc.) is a
**plugin-level** concern built on top of the stream interface.

Payload consumption is managed by Kitty core. Once consumed, payload
data follows core policy (memory threshold with temp-file fallback) so
downstream handlers can re-access it transparently as stream-based data
or via one-shot fan-in accessors built on top of the same policy.

Goal:

- Keep memory safety and temporary storage lifecycle in core.
- Keep handler consumption behavior transparent and consistent.
- Avoid forcing downstream code to manually coordinate finished-state
  edge cases for common payload reads.

After `exchange.isFinished` is true, `response.body.data` setter
must reject further writes. This guard belongs in the Exchange
Template layer.

## Server Lifecycle Ownership

> Stable conclusion moved to [ARCHITECTURE.md](ARCHITECTURE.md#server-lifecycle-ownership).

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

Since Workflow does not track active exchanges, a graceful shutdown
requires the caller to coordinate at the server level:

```js
server.close(async () => {
  // All connections drained.
  // Workflow handlers are no longer invoked.
});
```

For more sophisticated draining (e.g., waiting for in-flight
ExchangeKit promises), the Adapter recipe can expose a drain
capability on `DeploymentKit`:

```js
// Adapter recipe:
kit['drain'] = async () => {
  // Wait for all tracked ExchangeKit promises
  await Promise.all(activeExchanges);
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
     parent[EVENT_BUS] = new EventEmitter();
   });
   ```

2. **User** passes it to `KittyWorkflow`:

   ```js
   const app = new Kitty.Workflow(kit);
   ```

3. **External code** subscribes via the same kit:

   ```js
   kit[EVENT_BUS].on('user.login', data => { ... });
   ```

4. **Business handler** accesses the bus via the kit inheritance chain
   (ExternalKit → KitWorkflow → DeploymentKit → ExchangeKit):

   ```js
   // Inside a handler registered via use():
   function handler(ExchangeKit, next) {
     ExchangeKit[EVENT_BUS].emit('user.login', { userId });
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

### What this means for handleExchange

The `handleExchange` bridge does not need to wire up events.
Events flow through the kit chain automatically: anything installed
on ExternalKit is reachable from ExchangeKit. The Adapter recipe
does not need to propagate events — it only creates the
ExchangeKit, and kit inheritance does the rest.

## Design Constraints

> Stable description moved to [ARCHITECTURE.md](ARCHITECTURE.md#design-constraints).

> **Note**: The freezing claim in DESIGN.md previously stated
> `Object.freeze(this)` is called immediately after construction.
> This was incorrect — freezing happens at `finalize()`, not
> construction. ARCHITECTURE.md records the correct behavior.

## Adapter Artifact Split

> Stable description moved to [ARCHITECTURE.md](ARCHITECTURE.md#adapter-artifact-split).

### Protocol resources on ExchangeKit

The adapter owns the `stream` / `request` event and is responsible
for creating `ExchangeKit` inside it. At that point it can install
protocol-specific resources directly onto `ExchangeKit`:

```js
(
  server: object,
  listeners: Record<string | symbol, (...args: any[]) => any>,
) => unknown
  const ExchangeKit = DeploymentKit('Kitty<Exchange>');
  kit[K_STREAM] = stream;
  kit[K_SESSION] = stream.session;
  // ... install Exchange Template, then handle
  handle(ExchangeKit);
});
```

- `stream` gives access to stream-level features (trailers, push,
  reset).
- `stream.session` gives access to session-level features (settings,
  ping, goaway) — available without a separate `session` listener.
- Handlers import typed accessors (`useStream`, `useSession`) to
  consume these resources.

These protocol resources are **adapter-specific** and not part of the
core Exchange Template. They follow the same
"not installed, not available" contract as any other kit capability.

### Protocol-aware routing

Because all entry points (http1 request, http1 upgrade, http2 stream)
flow into the same workflow pipeline via `ExchangeKit`, the
protocol becomes a dimension at the handler layer — not an
infrastructure concern.

```js
workflow.use((kit, next) => {
  const exchange = useExchange(kit);

  if (exchange.protocol === 'ws') {
    return handleWebSocket(kit);
  }

  return next();
});
```

This is a novel capability — existing frameworks treat WebSocket and
other non-HTTP protocols as "exceptions" handled outside the
middleware pipeline. Kitty's `ExchangeKit` unification makes
protocol a first-class routing dimension.

> **Note (external, to be moved out)**: The semantics of `protocol`
> and `method` may overlap in ambiguous ways — e.g. `POST` is a
> method, `ws` is a protocol upgrade, `sse` is content negotiation.
> A future router module must decide how to express these dimensions
> without conflating them. The core layer intentionally stays out of
> this decision.

## Adapter Compliance Baseline (Draft)

This section captures a practical compliance baseline for adapter
authors. It is intentionally split into current requirements and
planned requirements that are still under design.

### Current required behaviors

- Build `ExchangeKit` from the provided `DeploymentKit` for each
  incoming logical exchange.
- Install a valid `Exchange` instance on `ExchangeKit` before calling
  `handleExchange`.
- Ensure `Exchange` links to the same server instance associated with
  `DeploymentKit`.
- Never dispatch the same `Exchange` instance more than once.
- Treat bridge errors as adapter implementation errors and fail fast.

### Planned adapter contract extensions

The following are directionally agreed but not finalized as complete
member-level API requirements:

- Keep `_I.INTERNAL` as the internal object group surface (for example,
  req/res, stream/session, socket, parser state, etc.).
- Add an additional identity-specific symbol/getter (separate from
  `_I.INTERNAL`) for logical exchange deduplication.
- Identity getter should return a stable marker for one logical
  exchange in the underlying protocol runtime.
- Exchange construction should validate identity semantics to ensure
  identity-exchange strong binding.
- Core bridge keeps Exchange-instance duplicate-dispatch checks; it
  does not consume identity for logical deduplication.

### Non-goal at this layer

- Business-level idempotency is not an adapter responsibility.
- Adapter compliance focuses on protocol mapping correctness and bridge
  invariants only.

## Glossary

- **Workflow**: The composed handler pipeline, produced by
  `Composer.compose()`.
- **Adapter**: A mapping between a server constructor and its
  adapter entry `{ name, install }`. Works only on the deployment-level
  kit (`Kitty<Deployment>`); has no effect on the Workflow-level kit.
- **Kit Recipe**: Describes dependencies to install into a kit.
  Adapter functions may still use recipes, but registry adapters are
  currently plain `install(AdapterKit)` functions.
- **listeners**: A protocol-specific record of event handlers, for
  example `{ request: (req, res) => {} }`.
- **link**: A plain function `(server, listeners) => unknown` that
  attaches artifact listeners to a server instance.
- **deploy**: Auto-discovery deployment — looks up an adapter from
  global Adapter registry by prototype chain.
- **adapt**: Ephemeral custom deployment — no global registration,
  one-off use with immediate invocation guard.

## Open Design Questions

<!-- setServerLinker resolved: explicit stack + compose internally, API stays setServerLinker -->
