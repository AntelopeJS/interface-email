# Feature map

One file per feature. `covers:` lists the source globs it owns, `docs:` the pages a verdict judges, `journeys:` the journeys it runs, and `seeded-breaks/<feature>.patch` the break its journeys must catch. `pnpm exec antelopejs-verify map` checks that every user-facing file is covered.

| Feature | What the user does | Journeys |
|---|---|---|
| [send](send.md) | A module sends one email, with addresses, attachments and options, and reads the provider's response. | send-through-core, send-pass-through, send-types |
| [templates](templates.md) | A module sends an email rendered from a provider-hosted or inline template. | template-through-core, template-pass-through, template-types |
| [batch](batch.md) | A module sends several emails in one call and reads one response per message. | batch-through-core, batch-pass-through, batch-types |
| [capabilities](capabilities.md) | A module reads the provider's limits and feature flags before using an optional feature. | capabilities-through-core, capabilities-pass-through, capabilities-types |
| [smoke](smoke.md) | The fixed journeys every verdict runs: load the packed interface with a stub provider and call every function. | every-function, minor-bump |
