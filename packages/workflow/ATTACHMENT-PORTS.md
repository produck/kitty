# Attachment Ports

This document records the attachment-port pattern used by
`KittyWorkflow` and grounded in the concrete capabilities of
`@produck/kit`. It can be read as a small application of
effect-oriented programming: a supplier receives a scoped capability
that permits a limited set of structural effects.

The underlying mechanism is still kit scope inheritance. Attachment
ports are not a separate effect library and do not require a type-tagged
effect runtime. They are ordinary kit-backed installation surfaces used
to perform controlled structural effects at the workflow boundary.

The pattern is a response to one design pressure: downstream mixins and
adapters need a way to configure the features they attach to a workflow,
but the workflow core should not accept an opaque `options` bag that it
cannot understand.

## Core Idea

`MixinKit` and `AdapterKit` are attachment ports.

An attachment port is a scoped kit handed to a capability supplier during
its installation phase. The supplier may retain the port in its own
private `WeakMap`, usually keyed by the workflow instance, and later use
that port to adjust the features it attached. It may also treat the port
as a one-shot installation argument and discard it immediately.

The port does not expose `WorkflowKit` directly. Structural writes must
pass through guarded methods on the port, such as `setWorkflowKit()` or
`setDeploymentKit()`. If the workflow lifecycle no longer allows that
write, the method throws.

```text
Capability supplier
  -> receives MixinKit / AdapterKit
  -> stores workflow -> port or workflow -> state in a WeakMap
  -> writes through guarded port methods
  -> downstream reads installed dependencies freely from kit scope
```

This makes configuration a responsibility of the capability supplier,
not of `KittyWorkflow` core.

## Why Not Deploy Options

A generic `workflow.deploy(server, options)` parameter makes core a
transport for data it does not understand. Core cannot validate the
fields, decide which downstream feature owns them, or explain how they
interact.

Attachment ports move that power to the place that owns the grammar and
the effect:

- body configuration belongs to the body mixin;
- protocol configuration belongs to the adapter;
- workflow core only provides lifecycle and attachment boundaries.

This preserves the minimum-knowledge rule for core while still allowing
real configuration. Core does not interpret downstream configuration;
it only issues the capability through which permitted effects may occur.

## Retention Is Optional

Retaining an attachment port is optional. The core contract is only that
the supplier receives a controlled attachment surface during
installation. It does not require a special core-defined builder,
controller, or registry for downstream configuration.

This keeps downstream suppliers autonomous. A supplier can decide its
own style:

- one-shot and functional: receive the port, install dependencies, and
  discard the port;
- retained control surface: keep `workflow -> port` in a private
  `WeakMap` and expose methods such as `configure(workflow, patch)`;
- retained state: keep `workflow -> state` when later adjustment is
  capability-owned mutable data rather than structural kit writes;
- hybrid: use the port for guarded structural writes and private state
  for runtime tuning.

For example, a purely functional mixin can be written without retaining
anything:

```js
export function body(options) {
  return function install(MixinKit) {
    MixinKit.setWorkflowKit(K_BODY_POLICY, createBodyPolicy(options));
  };
}
```

The user-facing API stays simple:

```js
workflow.mixin(body({ threshold: '10MB' }));
```

Another supplier may choose to retain its port and expose an adjustable
control surface:

```js
const kitByWorkflow = new WeakMap();

export function install(MixinKit) {
  const workflow = useWorkflow(MixinKit);

  kitByWorkflow.set(workflow, MixinKit);
  MixinKit.setWorkflowKit(K_BODY_POLICY, createBodyPolicy());
}

export function configure(workflow, patch) {
  const MixinKit = kitByWorkflow.get(workflow);

  if (MixinKit === undefined) {
    throw new Error('Body mixin is not installed on this workflow.');
  }

  MixinKit.setWorkflowKit(K_BODY_POLICY, createBodyPolicy(patch));
}
```

Both styles are valid. Attachment ports enable retained control
surfaces, but they do not impose one. Downstream autonomy is the point:
core provides the guarded attachment surface, and each supplier decides
whether to keep it, wrap it, or throw it away.

## Mixin Attachment

A mixin supplier receives a `MixinKit` when it is attached to a
workflow.

```js
const kitByWorkflow = new WeakMap();

export function install(MixinKit) {
  const workflow = useWorkflow(MixinKit);

  kitByWorkflow.set(workflow, MixinKit);
  MixinKit.setWorkflowKit(K_BODY_POLICY, createBodyPolicy());
}

export function configure(workflow, patch) {
  const MixinKit = kitByWorkflow.get(workflow);

  if (MixinKit === undefined) {
    throw new Error('Body mixin is not installed on this workflow.');
  }

  MixinKit.setWorkflowKit(K_BODY_POLICY, createBodyPolicy(patch));
}
```

The supplier does not receive `WorkflowKit`. It receives a controlled
port that can write to `WorkflowKit` only through methods defined by
`KittyWorkflow`.

If `setWorkflowKit()` is guarded by `ASSERT.NOT_FINALIZED`, then a
late `configure(workflow, patch)` call naturally fails after
finalization. The downstream user does not need to learn another
controller concept; they just discover that the workflow can no longer
be structurally changed.

## Adapter Attachment

An adapter supplier receives an `AdapterKit` when its adapter is used to
build a deployment artifact.

```js
const kitByWorkflow = new WeakMap();

export function install(AdapterKit) {
  const workflow = useWorkflow(AdapterKit);

  kitByWorkflow.set(workflow, AdapterKit);
  AdapterKit.setDeploymentKit(K_PROTOCOL_STATE, createProtocolState());
  AdapterKit.exportListener('request', createRequestListener());
  AdapterKit.setServerLinker(linkServer);
}
```

The adapter does not need a deploy-time options bag. It owns its
protocol grammar and installs protocol state through its port.

The lifecycle differs from `MixinKit`: `AdapterKit` writes to a concrete
`DeploymentKit`, so its authority belongs to one deployment artifact
construction. If an adapter supplier retains this port, its useful write
window should be constrained by deployment-artifact construction rather
than by workflow finalization.

## Controlled Writes, Free Reads

Attachment ports distinguish writes from reads.

Structural writes are controlled:

```js
MixinKit.setWorkflowKit(key, value);
AdapterKit.setDeploymentKit(key, value);
```

Those methods are the authority boundary. They can validate keys, check
lifecycle state, or reject writes after the relevant phase has closed.

Reads are ordinary kit behavior. Once a dependency is installed into the
kit hierarchy, downstream code can read it through the inherited kit
scope without asking core again.

```text
Install phase: guarded write through attachment port
Runtime phase: normal read through kit inheritance
```

This is the important split. Core protects structural mutation, while
capability-owned runtime state remains the supplier's responsibility.

## WeakMap Control Surface

A supplier may retain a workflow-keyed control surface:

```js
const stateByWorkflow = new WeakMap();

export function install(MixinKit) {
  const workflow = useWorkflow(MixinKit);
  const state = createState();

  stateByWorkflow.set(workflow, state);
  MixinKit.setWorkflowKit(K_FEATURE_STATE, state);
}

export function tune(workflow, patch) {
  const state = stateByWorkflow.get(workflow);

  if (state === undefined) {
    throw new Error('Feature is not installed on this workflow.');
  }

  Object.assign(state, patch);
}
```

A supplier can retain either the port or the feature state. Retaining
the port keeps all later structural writes behind core's guarded
methods. Retaining state is useful for capability-owned mutable data
that core cannot and should not police.

## Pattern Summary

```text
Attachment ports are kit-backed, lifecycle-guarded effect capabilities.

Core supplies the port.
The supplier owns the configuration grammar.
The supplier decides whether to retain or discard the port.
WeakMap links workflow identity to supplier state or ports.
Structural writes pass through guarded port methods.
Runtime reads use normal kit inheritance.
```

This is neither global configuration nor constructor-only static
configuration. It lets downstream suppliers configure and adjust their
own attached features while keeping `KittyWorkflow` core minimal and
ignorant of downstream option shapes. The claim is practical rather
than novel: it is an effect-capability style applied to the workflow
attachment boundary.
