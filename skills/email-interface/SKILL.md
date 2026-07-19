---
name: email-interface
description: Provider-agnostic email interface for AntelopeJS exposing Send, SendBatch, SendTemplate and GetCapabilities proxy functions with typed params for attachments, templates, tracking and scheduling. Use when code imports "@antelopejs/interface-email", when asked to send email / a templated email / a batch mailing from an AntelopeJS module, or when working with symbols like EmailParams, TemplateEmailParams, BatchEmailParams, EmailResponse, Attachment or ProviderCapabilities.
category: antelopejs-interface
tags: [antelopejs, email, templates, batch, providers]
---

# Email interface

Provider-agnostic email sending: consumers call four `InterfaceFunction` proxy points (`Send`, `SendBatch`, `SendTemplate`, `GetCapabilities`); a provider module (SendGrid, Mailgun, SES, ...) attaches the implementation at runtime. Everything else in the package is pure TypeScript types — no runtime crossing, no consumer-side helpers.

## Imports

The package has a single root export:

```ts
import { Send, SendBatch, SendTemplate, GetCapabilities } from "@antelopejs/interface-email";
import type { EmailParams, TemplateEmailParams, BatchEmailParams, EmailResponse, BatchEmailResponse, Attachment, ProviderCapabilities } from "@antelopejs/interface-email";
```

## Consuming

Add `@antelopejs/interface-email` to the module's `dependencies`, then call the functions — they are all async:

```ts
import { Send } from "@antelopejs/interface-email";

const response = await Send({
  to: { email: "user@example.com", name: "User" },
  subject: "Welcome aboard",
  html: "<h1>Welcome!</h1>",
  text: "Welcome!",
  attachments: [{ filename: "terms.pdf", contentType: "application/pdf", path: "/data/terms.pdf" }],
});
if (!response.success) {
  // response.error: { code, message, field?, retryable? }
}
```

`SendTemplate` takes `template: { id }` (provider-hosted) or `{ content, type }` (inline) plus `variables` / `recipientVariables`. `SendBatch` takes `{ messages, defaults?, continueOnError? }` and returns per-message results.

## Providing

Implementing this interface is the normal way to ship an email provider module:

```ts
import { ImplementInterface } from "@antelopejs/interface-core";
import * as EmailInterface from "@antelopejs/interface-email";

ImplementInterface(EmailInterface, {
  Send: async (params) => ({ success: true, status: "sent", messageId: "..." }),
  SendBatch: async (params) => ({ success: true, total: 0, successful: 0, failed: 0, responses: [] }),
  SendTemplate: async (params) => ({ success: true, status: "sent" }),
  GetCapabilities: async () => ({ name: "my-provider", features: { batch: true, templates: false, scheduling: false, openTracking: false, clickTracking: false, inlineAttachments: true, tags: false, metadata: false, priority: true } }),
});
```

Also declare `"antelopeJs": { "implements": ["@antelopejs/interface-email"] }` in the provider's `package.json`.

## Gotchas

- All four functions are async proxy crossings. With the interface in `dependencies`, calls made before the provider attaches are queued (always `await`); startup aborts if no loaded module provides it. Use `optionalDependencies` if email may legitimately be absent.
- Failures are usually reported in the response, not thrown: check `response.success` and `response.error` (its `retryable` flag tells you whether to retry).
- Feature support varies by provider — gate `schedule`, `tracking`, `tags`, `metadata`, `priority` and templates on `(await GetCapabilities()).features` before relying on them.
- `EmailParams` requires only `to` and `subject`; provide at least one of `text` / `html` (both for client compatibility). `from` falls back to the provider default.
- `Attachment` is a union with exactly one source field: `content: Buffer`, `content` + `encoding: "base64"`, `path`, or `url`. Inline images need `cid` (referenced as `cid:yourCid` in HTML) and `inline: true`.
- Batch: `continueOnError` defaults to `true`; `BatchEmailResponse.success` is `true` only if *all* messages succeeded — correlate individual results via `batchId` or `index`.
- `EmailStatus` includes `"queued"` and `"scheduled"` — a successful response does not mean delivered.

## Deeper reference

See the shipped `dist/index.d.ts` for the full field-by-field contract, and the repo's `docs/` on GitHub (AntelopeJS/interface-email — Introduction, Sending Emails, Attachments) for prose guides — do not restate them here.
