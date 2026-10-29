---
covers:
  - src/index.ts
docs:
  - docs/1.introduction.md
journeys:
  - capabilities-through-core
  - capabilities-pass-through
  - capabilities-types
---

# Capabilities

A module calls `GetCapabilities()` to read the provider's name, optional limits (`maxRecipients`, `maxBatchSize`, `maxAttachmentSize`, `maxEmailSize`, in bytes) and `features` flags before it relies on an optional feature.

## Sub-features

- `capabilities-through-core`: in `ajs project dev`, a consumer calls `GetCapabilities` through core and the stub provider answers with no arguments received.
- `capabilities-pass-through`: with a stand-in provider attached to `GetCapabilities`, each call reaches the provider without arguments and its capabilities come back untouched; an absent limit stays absent.
- `capabilities-types`: a probe compiled in strict mode against the packed declarations pins `GetCapabilities`, `GetCapabilitiesFunction`, `ProviderCapabilities` and `ProviderFeatures` to the documented shapes, in both directions.

## How to get to it (user POV)

- `const caps = await GetCapabilities(); if (caps.features.scheduling) { ... }`.

## Driving it with antelopejs-verify

```bash
pnpm exec antelopejs-verify journey "$RUN" capabilities
```

## Gotchas

- An absent limit is not a promise of unlimited capacity; the journeys only prove that the interface does not invent one.
