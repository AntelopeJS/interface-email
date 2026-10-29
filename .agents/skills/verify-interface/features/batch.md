---
covers:
  - src/index.ts
docs:
  - docs/1.introduction.md
  - docs/2.sending-emails.md
journeys:
  - batch-through-core
  - batch-pass-through
  - batch-types
---

# Batch

A module calls `SendBatch(params)` with `messages` (each an `EmailParams` with an optional `batchId`), optional `defaults` and `continueOnError`, and reads one `BatchEmailMessageResponse` per message.

## Sub-features

- `batch-through-core`: in `ajs project dev`, a consumer calls `SendBatch` through core with two messages and defaults and the stub provider receives exactly those arguments.
- `batch-pass-through`: with a stand-in provider attached to `SendBatch`, the messages, the defaults and `continueOnError` reach the provider unchanged (the interface applies no default itself) and the per-message answers, including a failed one with its `EmailError`, come back untouched; a provider rejection reaches the caller.
- `batch-types`: a probe compiled in strict mode against the packed declarations pins `SendBatch`, `SendBatchFunction`, `BatchEmailMessage`, `BatchEmailParams`, `BatchEmailMessageResponse` and `BatchEmailResponse` to the documented shapes, in both directions.

## How to get to it (user POV)

- `const result = await SendBatch({ messages, defaults: { from: "noreply@myapp.com" } })`, then check `result.responses` for the failures.

## Driving it with antelopejs-verify

```bash
pnpm exec antelopejs-verify journey "$RUN" batch
```

## Gotchas

- Merging `defaults` into messages and continuing after a failure are the provider's behaviour; the journeys prove only that the interface passes them on and returns the answer.
