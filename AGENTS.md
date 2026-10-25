# interface-email

The AntelopeJS contract for sending email, published as `@antelopejs/interface-email`. The whole interface is `src/index.ts`: the message, attachment and result types, and four `InterfaceFunction` exports (`Send`, `SendBatch`, `SendTemplate`, `GetCapabilities`). Providers such as `@antelopejs/nodemailer` implement it.

## Compatibility

`ImplementInterface` in the core refuses a provider that lacks a declared function. Adding an `InterfaceFunction` export therefore breaks every published implementation until it implements the new function; ship it as a breaking release and update the implementations listed in the README.

`@antelopejs/interface-core` is a peer dependency with the range `>=0.2.4 <1.0.0`, mirrored in `devDependencies`. Change both entries together.

## Checks

- The package has no runtime tests. `pnpm test` runs `pnpm run build`, which emits `dist` and its declarations; `pnpm run checks` runs it once.
- CI also checks `README.md` and `docs/` with the shared documentation action (`docs-files` in `.github/workflows/ci.yml`). `pnpm run checks` does not run that check.

## Shipped files

- `docs/` and `skills/` ship in the npm package. `skills/` reaches users through `antelopeJs.skills`; when the interface changes, update `skills/email-interface/SKILL.md` and the matching page in `docs/`.
- Releases run from the Release workflow (`workflow_dispatch`, channel `latest` from `main` or `next` from `next`). release-it writes `CHANGELOG.md` through changelogen.

<!-- antelopejs-guardrails:start -->
<!-- Managed by @antelopejs/tooling-configs. `antelopejs-sync` rewrites everything between these markers; write repository-specific guidance outside them. -->

## Guardrails

Finish every change with `pnpm run checks`. It runs typecheck, lint, format, knip, tests, size, ratchet, and sync, and prints only what failed. The change is done when it prints no failure.

The tools enforce most rules, listed in the table at the end. The sections below hold the rules no tool checks.

### Comments

Say it in code. A constraint belongs in a type, a lint rule, or a test. A public item's contract belongs in TSDoc (`/** */`) on that item. The only other comments are lint directives that name their rules, `@ts-expect-error <reason>`, `SAFETY: <reason>` above a type assertion, `/*!` license headers, and bundler or formatter directives.

### Tests

Hold every test you write or keep to this checklist:

- Name the wrong implementation this test fails on. A test with no answer is deleted, not kept.
- No test reads the file it tests. Drive the behaviour through the public interface.
- An invariant over many files is a lint rule, not a test.

### Debt

`guardrails.ratchet.json` records the lint findings and oversize files this repository already had. Its numbers only go down. After you remove debt, run `pnpm run ratchet:update` and commit the lowered file. A rule listed there is off for `oxlint`. The ratchet counts it instead, and the pre-commit hook rejects it on every line you add.

### What enforces what

| Rule                                                                           | Enforced by                               |
| ------------------------------------------------------------------------------ | ----------------------------------------- |
| Formatting                                                                     | oxfmt                                     |
| Lint findings are errors; no rule warns                                        | oxlint preset                             |
| Comments are TSDoc, directives, or `SAFETY:` only                              | `antelopejs/no-comments`                  |
| Every test asserts                                                             | `antelopejs/require-assertion`            |
| Tests read no files outside fixtures, helpers, locales                         | `antelopejs/no-fs-read-in-tests`          |
| No assertion that restates a constant                                          | `antelopejs/no-constant-value-assertion`  |
| No test whose only check is "is a function"                                    | `antelopejs/no-typeof-function-only-test` |
| Params ≤ 5, function ≤ 120 lines, file ≤ 500 lines, depth ≤ 4, complexity ≤ 20 | `eslint/max-*`, `eslint/complexity`       |
| Files ≤ 20,000 bytes, tests included                                           | `antelopejs-check-size` (pre-commit)      |
| Existing debt only shrinks                                                     | `antelopejs-ratchet`                      |
| Types check                                                                    | `tsc` (pre-push)                          |
| No dead files, exports, or dependencies                                        | knip                                      |
| Managed files match the pack                                                   | `antelopejs-sync --check`                 |
| A test names the wrong implementation it catches                               | review; no tool                           |

<!-- antelopejs-guardrails:end -->
