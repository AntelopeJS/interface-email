# @antelopejs/interface-email

<div align="center">
<a href="https://www.npmjs.com/package/@antelopejs/interface-email"><img alt="npm" src="https://img.shields.io/npm/v/@antelopejs/interface-email?style=for-the-badge&labelColor=000000&color=000000"></a>
<a href="./LICENSE"><img alt="License" src="https://img.shields.io/npm/l/@antelopejs/interface-email?style=for-the-badge&labelColor=000000&color=000000"></a>
<a href="https://discord.gg/g4pFt6eXqu"><img alt="Discord" src="https://img.shields.io/badge/Discord-18181B?logo=discord&style=for-the-badge&color=000000"></a>
<a href="./docs/1.introduction.md"><img alt="Docs" src="https://img.shields.io/badge/Docs-18181B?style=for-the-badge&color=000000"></a>
</div>

The AntelopeJS contract for sending email: one API for single, batch and template messages, whatever provider delivers them.

## What it offers

- `Send` sends one message with text or HTML, recipients, threading headers and attachments.
- `SendBatch` sends several messages in one call, with shared defaults.
- `SendTemplate` renders a provider template or an inline template with variables.
- `GetCapabilities` reports what the provider supports, such as scheduling or tracking.
- `Send` and `SendTemplate` return a status, an optional provider message ID and optional error details. `SendBatch` returns totals and individual message results; `GetCapabilities` returns provider features and limits, not delivery results.

## Implementations

| Module                                                               | Notes                   |
| -------------------------------------------------------------------- | ----------------------- |
| [`@antelopejs/nodemailer`](https://github.com/AntelopeJS/nodemailer) | SMTP through Nodemailer |

## Install

Add the interface to the module that sends email:

```bash
pnpm add @antelopejs/interface-email
```

Then add an implementation to the project:

```bash
ajs project modules add @antelopejs/nodemailer
```

## Quick start

```ts
import { Send } from "@antelopejs/interface-email";

export async function sendWelcome(address: string) {
  const response = await Send({
    to: address,
    subject: "Welcome aboard",
    html: "<p>Thanks for joining.</p>",
    text: "Thanks for joining.",
  });

  if (!response.success) {
    throw new Error(response.error?.message);
  }
  return response.messageId;
}
```

## Documentation

- [Introduction](./docs/1.introduction.md)
- [Sending emails](./docs/2.sending-emails.md)
- [Attachments](./docs/3.attachments.md)

## Compatibility

<!-- antelopejs-docs-compat:start -->

| Package                      | Supported        | Tested with |
| ---------------------------- | ---------------- | ----------- |
| `@antelopejs/interface-core` | `>=0.2.4 <1.0.0` | `0.2.4`     |

<!-- antelopejs-docs-compat:end -->

This is the peer requirement in `package.json`. The package does not declare an
`@antelopejs/core` peer range; check the implementing module's requirements too.

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before you open a pull request. The local checks are:

```bash
pnpm install
pnpm lint
pnpm build
```

## License

[Apache-2.0](./LICENSE)
