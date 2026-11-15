# interface-email

The AntelopeJS contract for sending email, published as `@antelopejs/interface-email`. The whole interface is `src/index.ts`: the message, attachment and result types, and four `InterfaceFunction` exports (`Send`, `SendBatch`, `SendTemplate`, `GetCapabilities`). Providers such as `@antelopejs/nodemailer` implement it.

## Compatibility

`ImplementInterface` in the core refuses a provider that lacks a declared function. Adding an `InterfaceFunction` export therefore breaks every published implementation until it implements the new function; ship it as a breaking release and update the implementations listed in the README.

`@antelopejs/interface-core` is a peer dependency with the range `>=0.5.1 <0.6.0`, mirrored in `devDependencies`. Change both entries together.

## Checks

- `tests/json-object.types.ts` is a compile-time test of what `JsonObject` accepts and rejects. `tsconfig.json` (typecheck) includes `tests`; `tsconfig.build.json` (the `build` script) emits only `src`.
- The package has no runtime tests. `pnpm test` runs `pnpm run build`, which emits `dist` and its declarations; `pnpm run checks` runs it once.
- CI also checks `README.md` and `docs/` with the shared documentation action (`docs-files` in `.github/workflows/ci.yml`). `pnpm run checks` does not run that check. To run it locally, clone `AntelopeJS/tooling-configs` at the commit `ci-node.yml` pins, run `npm ci --prefix <clone>/actions/docs --omit=dev --ignore-scripts`, then from this repository `node <clone>/actions/docs/check.mjs --files $'README.md\ndocs'`.

## Shipped files

- `docs/` and `skills/` ship in the npm package. `skills/` reaches users through `antelopeJs.skills`; when the interface changes, update `skills/email-interface/SKILL.md` and the matching page in `docs/`.
- The Release workflow runs release-it, which writes `CHANGELOG.md` through changelogen.

<!-- antelopejs-guardrails:start -->
<!-- Managed by @antelopejs/tooling-configs. `antelopejs-sync` rewrites everything between these markers; write repository-specific guidance outside them. -->

## Guardrails

CI runs `pnpm run checks` in full on every pull request and reports what failed. The commit hook formats and lints the staged files. Locally, run only the fast check for what you touched:

- `pnpm run typecheck` after you change types or signatures.
- `pnpm exec oxlint <files>` and `pnpm exec oxfmt <files>` on the files you changed.
- One test file, not the suite. In a module that tests with `ajs module test`: `pnpm run build`, then `pnpm exec ajs module test . -f dist/<path>.test.js`.

Prove a change works with the verification skill in [`.agents/skills/verify-interface/SKILL.md`](.agents/skills/verify-interface/SKILL.md) before you call it done.

### Comments

Say it in code: a constraint in a type, a lint rule or a test, a public item's contract in TSDoc. Other comments are lint directives naming their rules, `@ts-expect-error <reason>`, `SAFETY: <reason>` above a type assertion, and license or tool directives. A reason states what the code does now.

### Tests

Each test names the wrong implementation it fails on, or is deleted. Drive behaviour through the public interface. An invariant over many files is a lint rule.

### Review

No tool checks these:

- A type guard checks the nested elements and values it claims.
- A no-upward import rule rejects same-tier peers; probe it with an import.
- A finding only an evasion or a patched internal can trigger goes under Attention and never blocks.

### Suppressions

`guardrails.suppressions.json` caps lint directives, `@ts-expect-error`, `SAFETY:` comments and rules a lint config turns off. Over a cap, fix the code or remove another suppression of that kind; only the operator raises a number. After removing suppressions, run `pnpm run suppressions:update` and commit the file.

<!-- antelopejs-guardrails:end -->
