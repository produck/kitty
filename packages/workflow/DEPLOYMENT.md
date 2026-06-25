# Deployment Paths

This document describes the deployment-facing features of
`KittyWorkflow`: `deploy()`, `compile()`, and the ephemeral `adapt()`
path.

`KittyWorkflow` is similar to Koa in that both organize request
handling around a middleware pipeline. Kitty differs at the deployment
boundary: it treats the connection between a workflow and a server as
an explicit adapter protocol. That gives downstream code a controlled
place to customize deployment behavior without turning every concern
into request middleware.

## Mental Model

The three deployment paths expose different amounts of the adapter
protocol.

- `workflow.deploy(server)` uses the standard adapter plug. It looks up
  the registered adapter for the server constructor, compiles a
  deployment artifact, and links it to the server.
- `workflow.compile(server)` removes the standard plug and exposes the
  listener wires. It returns the listener record so callers can attach
  handlers manually.
- `workflow.adapt(options)` gives the workflow a temporary deployment
  adapter. Downstream code can provide one custom deployment kit for a
  single compile or deploy opportunity, without registering anything
  globally.

The third path is intentionally not just another middleware hook. It is
an adapter-level customization point for cases where request handling is
not enough.

## Deployment Artifact

Adapter compilation produces a deployment artifact:

```js
{
  listeners,
  link,
}
```

`listeners` is a record of protocol-specific event handlers. Keys may
be strings or symbols, and values are functions.

`link` is a function with this shape:

```ts
(server: object, listeners: Record<string | symbol, (...args: any[]) => any>) =>
  unknown;
```

`deploy()` calls `link(server, listeners)`. `compile()` returns the
listeners and leaves linking to the caller.

## Standard Deploy

`deploy(server)` is the default path for ordinary use.

1. Look up the adapter entry from `Adapter.Registry` by server
   constructor.
2. Create `DeploymentKit` from the workflow kit.
3. Create `AdapterKit` from `DeploymentKit`.
4. Run `adapter.install(AdapterKit)`.
5. Validate the resulting deployment artifact.
6. Call `artifact.link(server, artifact.listeners)`.
7. Run deployment modifiers registered by mixins.

The registry entry stores both a logical adapter name and the adapter
function:

```js
{
  name,
  install,
}
```

The logical adapter name is not the same concept as
`server.constructor.name`. The constructor name describes the server
implementation class; the adapter name describes the protocol bridge.

## Compile

`compile(server)` uses the same registered adapter source as
`deploy()`, but stops before the link phase.

It is useful when the caller wants Kitty to produce validated listener
functions but wants to attach them manually. This is the exposed-wires
path: Kitty provides the protocol handlers, and the application decides
how to connect them.

Examples include custom event attachment, partial attachment, tests, or
embedding Kitty listeners into a larger server lifecycle.

## Ephemeral Adapt

`adapt(options)` is the path for temporary adapter replacement. It is
a stable Composition-layer decision, not part of the Abstract
workflow lifecycle skeleton. The Abstract layer provides the normal
`compile()` / `deploy()` lifecycle and deployment-kit initialization;
`CompoundKittyWorkflow` owns `adapt()` because it is the layer that
combines Workflow, Mixin, and Adapter domains.

The temporary adapter should not register anything globally and should
not occupy the constructor slot in `Adapter.Registry`.

Instead, it creates a one-off deployment adapter scope. Downstream code
can provide a temporary adapter with core bridge behavior plus extra
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

- custom server variants not covered by official adapters;
- tests that need a temporary adapter without global registration;
- embedded servers with nonstandard event wiring;
- protocol experiments that should not pollute the global registry;
- handler downstream code that needs a one-off deployment kit with
  additional capabilities.

## One-Shot Constraint

The ephemeral adapter path is one-shot and same-tick. A single
`adapt()` call creates one temporary deployment opportunity. Exactly
one of the returned `compile()` or `deploy()` operations must be
called synchronously at the call site, before the queued microtask
expires the scope. After the operation is called, its promise may settle
asynchronously.

If a caller needs both a manual compile and a deploy, it should call
`adapt()` twice.

This keeps the deployment state simple: each temporary adapter scope has
one outcome, and the workflow avoids retaining ambiguous partially used
adapter state.

## Relation To Mixins

Mixins customize workflow and deployment behavior through the Kitty kit
hierarchy. They are installed before finalization and participate in the
normal deployment path.

Ephemeral adapters are different. They customize the adapter used for a
particular deployment opportunity. They are not global registry entries
and are not long-lived workflow plugins.

A deployment may use both mechanisms: mixins can prepare shared
deployment capabilities, while an ephemeral adapter can decide how the
workflow is connected to a particular server-like object.
