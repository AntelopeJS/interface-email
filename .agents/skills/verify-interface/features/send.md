---
covers:
  - src/index.ts
docs:
  - docs/1.introduction.md
  - docs/2.sending-emails.md
  - docs/3.attachments.md
journeys:
  - send-through-core
  - send-pass-through
  - send-types
---

# Send

A module calls `Send(params)` with an `EmailParams` (`to` and `subject` required, content, addresses, attachments, threading, priority, tracking, tags, metadata, schedule and provider options optional) and gets an `EmailResponse` back from whichever provider module implements the interface.

## Sub-features

- `send-through-core`: in `ajs project dev`, a consumer module calls `Send` with a realistic message through core and the stub provider receives exactly those arguments.
- `send-pass-through`: in a Node process with a stand-in provider attached to `Send`, the message reaches the provider unchanged with a `Buffer` attachment still a `Buffer` and a `Date` still a `Date`; the provider's answer comes back unchanged (`timestamp` a `Date`); an unsuccessful `EmailResponse` is returned, not thrown; a provider rejection reaches the caller.
- `send-types`: a probe compiled in strict mode against the packed declarations pins `Send`, `SendFunction`, `EmailParams`, `EmailResponse`, `EmailStatus`, `EmailError`, the address, attachment, tracking, schedule and priority types and `JsonValue`/`JsonObject` to the documented shapes, in both directions, so an added optional field or an `any` widening fails.

## How to get to it (user POV)

- `const response = await Send({ to: "user@example.com", subject: "Welcome", html: "<p>Hi</p>" })` in a project that loads an email provider module.

## Driving it with antelopejs-verify

```bash
pnpm exec antelopejs-verify journey "$RUN" send
```

## Gotchas

- The provider is a stand-in: delivery, size limits, attachment fetching and provider defaults are the provider's, so these journeys prove what this interface hands over and returns, not what a real provider does.
