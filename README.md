# @antelopejs/interface-email

<div align="center">
<a href="https://www.npmjs.com/package/@antelopejs/interface-email"><img alt="npm" src="https://img.shields.io/npm/v/@antelopejs/interface-email?style=for-the-badge&labelColor=000000&color=000000"></a>
<a href="./LICENSE"><img alt="License" src="https://img.shields.io/npm/l/@antelopejs/interface-email?style=for-the-badge&labelColor=000000&color=000000"></a>
<a href="https://discord.gg/sjK28QHrA7"><img alt="Discord" src="https://img.shields.io/badge/Discord-18181B?logo=discord&style=for-the-badge&color=000000"></a>
<a href="https://github.com/AntelopeJS/interface-email/tree/main/docs"><img alt="Docs" src="https://img.shields.io/badge/Docs-18181B?style=for-the-badge&color=000000"></a>
</div>

The AntelopeJS contract for sending email: one API for single, batch and template messages, whatever provider delivers them.

## What it offers

- `Send` sends one message with text or HTML, recipients, threading headers and attachments.
- `SendBatch` sends several messages in one call, with shared defaults.
- `SendTemplate` renders a provider template or an inline template with variables.
- `GetCapabilities` reports what the provider supports, such as scheduling or tracking.
- Every call returns a typed response with a status, a provider message ID and error details.

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

| Package                             | Range            |
| ----------------------------------- | ---------------- |
| `@antelopejs/interface-core` (peer) | `>=0.0.3 <1.0.0` |
| `@antelopejs/core`                  | `1.x`            |

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before you open a pull request. The local checks are:

```bash
pnpm install
pnpm lint
pnpm build
```

## License

[Apache-2.0](./LICENSE)
