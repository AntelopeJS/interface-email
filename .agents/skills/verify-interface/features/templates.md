---
covers:
  - src/index.ts
docs:
  - docs/1.introduction.md
  - docs/2.sending-emails.md
journeys:
  - template-through-core
  - template-pass-through
  - template-types
---

# Templates

A module calls `SendTemplate(params)` with a `TemplateEmailParams`: a provider-hosted template (`{ id, version? }`) or an inline one (`{ content, type, engine? }`), shared `variables` and `recipientVariables` keyed by address.

## Sub-features

- `template-through-core`: in `ajs project dev`, a consumer calls `SendTemplate` through core with a hosted and an inline template and the stub provider receives exactly those arguments.
- `template-pass-through`: with a stand-in provider attached to `SendTemplate`, both template kinds, the variables, the per-recipient variables, the attachments and the schedule reach the provider unchanged and its answer comes back untouched; a provider rejection reaches the caller.
- `template-types`: a probe compiled in strict mode against the packed declarations pins `SendTemplate`, `SendTemplateFunction`, `TemplateEmailParams`, `ProviderTemplate` and `InlineTemplate` to the documented shapes, in both directions.

## How to get to it (user POV)

- `await SendTemplate({ to: "user@example.com", template: { id: "welcome-v2" }, variables: { name: "Alice" } })`.

## Driving it with antelopejs-verify

```bash
pnpm exec antelopejs-verify journey "$RUN" templates
```

## Gotchas

- Rendering placeholders is the provider's job; the journeys prove only that the template and variables reach it as given.
