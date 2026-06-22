# KittyWorkflow Stable Architecture Notes

This file records decisions that are stable enough for long-term
reference.

The design draft in DESIGN.md is still the primary AI collaboration
workspace. When a section is considered stable, copy the final wording
here.

## Document Roles

- DESIGN.md: exploration draft, alternatives, open questions.
- ARCHITECTURE.md: stable contracts, settled naming, fixed invariants.

## Stable Terminology

- Exchange: one HTTP request and its response as one runtime unit.
- ExchangeKit: the per-exchange kit derived from DeploymentKit.
- AdapterKit: adapter bridge kit for listener export and server linking.
- DeploymentKit: per-server deployment scope, parent of ExchangeKit.

## Stable Invariants

- Workflow core does not hardcode protocol behavior.
- Adapters map protocol events to ExchangeKit and enter workflow through
  handleExchange.
- Exchange state access is mediated through the Exchange abstraction.
- Naming uses Exchange consistently; transaction terminology is retired.

## handleExchange Guardrails

handleExchange is the adapter-to-workflow bridge. It must reject bad
adapter input before any workflow handler runs.

- ExchangeKit must be derived from the current DeploymentKit.
- ExchangeKit must not be the DeploymentKit itself.
- Exchange must already be installed on ExchangeKit.
- Installed Exchange must be an instance of the Exchange abstraction.
- Exchange must be linked to the current server.
- The same Exchange instance must not be dispatched more than once.

Responsibility boundary:

- Violations at this boundary are adapter errors, not handler errors.
- `.use()` handlers may assume a validated ExchangeKit once workflow
  execution begins.

## Duplicate-Consumption Principle

Kitty uses two binding checks to prevent accidental duplicate
processing:

- Identity-exchange strong binding (Exchange layer):
  Exchange construction validates identity-object consumption semantics
  so one consumed identity cannot be rebound to another Exchange.
- Exchange-workflow execution strong binding (bridge layer):
  `handleExchange` rejects repeated dispatch of the same Exchange
  instance before workflow execution.

This keeps model-level identity safety and bridge-level execution
safety separated while preserving adapter responsibility boundaries.

## Adapter Identity Quick Rules

Kitty cannot fully prevent malicious adapter implementations, but it
can make correct implementations easy and incorrect ones fail fast.

Use the following low-cognitive-load identity rules:

- Prefer one native per-exchange object as identity.
- HTTP/1.x default: use `req` as identity.
- HTTP/2 default: use `stream` as identity.
- Do not use `socket` as exchange identity.
- Do not return a newly wrapped object for identity.
- Keep identity stable for the whole exchange lifecycle.

Operational expectation:

- Adapter authors choose identity by selection, not by invention.
- If identity is implemented poorly, failures should surface early at
  Exchange construction or bridge dispatch boundaries.

## Incremental Migration Rule

When moving content from DESIGN.md to this file:

- Keep only finalized conclusions.
- Remove draft rationale that is still under discussion.
- Prefer short, testable statements over broad narrative text.
