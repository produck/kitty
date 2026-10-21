# Deployment Paths

This document describes the deployment-facing features of
`KittyWorkflow`: `deploy()`, `compile()`, and the ephemeral `adapt()`
path.

`KittyWorkflow` is similar to Koa in that both organize request
handling around a middleware pipeline. Kitty differs at the deployment
boundary: it treats the connection between a workflow and a server as
an explicit deployer protocol. That gives downstream code a controlled
place to customize deployment behavior without turning every concern
into request middleware.

## Mental Model

The three deployment paths expose different amounts of the deployer
protocol.

- `workflow.deploy(server)` uses the standard deployer plug. It looks up
  the registered deployer for the server constructor, builds a
  deployment, and links it to the server.
- `workflow.compile(server)` removes the standard plug and exposes the
  listener wires. It returns the listener record so callers can attach
  handlers manually.
- `workflow.adapt(options)` gives the workflow a temporary deployment
  deployer. Downstream code can provide one custom deployment kit for a
  single compile or deploy opportunity, without registering anything
  globally.

The third path is intentionally not just another middleware hook. It is
a deployer-level customization point for cases where request handling is
not enough.

## Deployment

Compiling a workflow against a server produces a `Deployment`
(`Workflow/Deployment/`). It is the object the deployer fills in and the
object `deploy()` links.

`deployment.listeners` is a record of protocol-specific event handlers.
Keys may be strings or symbols, and values are functions. The deployer
accumulates it through `exportListener` calls during the install phase,
and it represents the **public interface** that compile-path callers can
attach manually.

The listener record is **not consumed by `link`**. The deployer's linkers
capture handler references via closure during install; the record is an
output for the `compile()` path only.

`deployment.link()` runs the composed linker chain. Linkers are registered
via `setServerLinker` and keep a LIFO order; each captured the server and
all handler references via closure during `deployer[$I.INSTALL]()`.

`deploy()` calls `deployment.link()` to wire the server. `compile()`
returns `deployment.listeners` and leaves linking to the caller.

## Standard Deploy

`deploy(server)` is the default path for ordinary use.

It refuses to run until a request body distributor class has been set
with `workflow.setRequestBodyDistributorConstructor(Ctor)`; the class is what a
request body instantiates, so deploying without it would fail on the
first request. `compile(server)` is not gated — producing the listener
functions may happen before the class is chosen.

1. Look up the deployer class from `Deployer.Registry` by server
   constructor.
2. Create the `Deployment` — `DeploymentKit` derived from the workflow
   kit, plus the server, which is also attached to the kit as a
   capability.
3. Run the mixin deployment attachers on the deployment kit.
4. Create `DeployerKit` from the deployment kit and construct the
   deployer with it and the deployment.
5. Run `deployer[$I.INSTALL]()` — the deployer fills the deployment
   through its kit ports: listeners (`exportListener`), linkers
   (`setServerLinker`), exchange attachers (`appendExchangeAttacher`),
   deployment content (`attachDeployment`), and the per-protocol dispatch
   entries. The workflow then registers its mixin exchange attachers on
   the deployment and seals it.
6. Call `deployment.link()` — the composed linker chain runs. Linkers
   capture the server and handler references via closure during install,
   so no arguments are needed.

The registry entry stores both a logical deployer name and the deployer
function:

```js
{
  name,
  install,
}
```

The logical deployer name is not the same concept as
`server.constructor.name`. The constructor name describes the server
implementation class; the deployer name describes the protocol bridge.

## Compile

`compile(server)` uses the same registered deployer source as
`deploy()`, but stops before the link phase.

It is useful when the caller wants Kitty to produce validated listener
functions but wants to attach them manually. This is the exposed-wires
path: Kitty provides the protocol handlers, and the application decides
how to connect them.

Examples include custom event attachment, partial attachment, tests, or
embedding Kitty listeners into a larger server lifecycle.

## Ephemeral Adapt

`adapt(options)` is the path for temporary deployer replacement. It is
a stable Composition-layer decision, not part of the Abstract
workflow lifecycle skeleton. The Abstract layer provides the normal
`compile()` / `deploy()` lifecycle and deployment-kit initialization;
`CompoundKittyWorkflow` owns `adapt()` because it is the layer that
combines Workflow, Mixin, and Deployer domains.

The temporary deployer should not register anything globally and should
not occupy the constructor slot in `Deployer.Registry`.

Instead, it creates a one-off deployment deployer scope. Downstream code
can provide a temporary deployer with core bridge behavior plus extra
custom deployment capabilities. The returned operations must be
called synchronously for exactly one outcome: compile once or deploy
once. The operations themselves follow the normal async deployment API
shape and return promises.

This is one of Kitty's interesting differences from Koa. Koa primarily
extends request processing through middleware. Kitty can also offer a
controlled deployment-stage customization point, allowing downstream
code to change how the workflow is connected to a server or event
source for special cases.

Useful cases include:

- custom server variants not covered by official deployers;
- tests that need a temporary deployer without global registration;
- embedded servers with nonstandard event wiring;
- protocol experiments that should not pollute the global registry;
- handler downstream code that needs a one-off deployment kit with
  additional capabilities.

## One-Shot Constraint

The ephemeral deployer path is one-shot and same-tick. A single
`adapt()` call creates one temporary deployment opportunity. Exactly
one of the returned `compile()` or `deploy()` operations must be
called synchronously at the call site, before the queued microtask
expires the scope. After the operation is called, its promise may settle
asynchronously.

If a caller needs both a manual compile and a deploy, it should call
`adapt()` twice.

This keeps the deployment state simple: each temporary deployer scope has
one outcome, and the workflow avoids retaining ambiguous partially used
deployer state.

## Relation To Mixins

Mixins customize workflow and deployment behavior through the Kitty kit
hierarchy. They are installed before finalization and participate in the
normal deployment path.

Ephemeral deployers are different. They customize the deployer used for a
particular deployment opportunity. They are not global registry entries
and are not long-lived workflow plugins.

A deployment may use both mechanisms: mixins can prepare shared
deployment capabilities, while an ephemeral deployer can decide how the
workflow is connected to a particular server-like object.
