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

## Incremental Migration Rule

When moving content from DESIGN.md to this file:

- Keep only finalized conclusions.
- Remove draft rationale that is still under discussion.
- Prefer short, testable statements over broad narrative text.
