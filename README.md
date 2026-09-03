# pw-hybrid-framework

QA automation framework for **floorOS**, organized so **one QA owns one
module** (CRM, Fabric Mill, Costing, ...) end to end, runs it against
**local first**, then promotes the same tests to **dev** with one flag —
no code changes between environments.

## Why it's shaped this way

floorOS is a shell + remotes micro-frontend: `app-shell` owns auth and
routing, and every module (`app-crm`, `app-mill`, ...) is mounted under it
at its own path. That has two consequences for this framework:

1. **There's one target, not N** — every test drives `app-shell`'s
   `baseURL` and navigates into `/crm`, `/mill`, etc. Nothing is
   pointed at a module's standalone dev port.
2. **Auth happens once** — each module logs in as its own seeded test
   user (Keycloak), caches the session, and every spec in that module
   reuses it. No spec re-logs-in.

Modules are otherwise fully isolated: `tests/<module>/`,
`src/pages/<module>/`, `src/fixtures/<module>.fixtures.ts`. A QA working
on CRM never has a reason to open a file under `mill/`, and two QAs never
collide in the same file — enforced by [CODEOWNERS](./CODEOWNERS).

## Stack

- **Playwright Test** (`@playwright/test`) — runner, assertions, browser
  contexts, parallelism, retries, HTML reporting.
- **TypeScript**, strict mode.
- **dotenv** for environment config (`.env` + `.env.local` / `.env.dev` overrides).
- **ESLint + Prettier**.

## Structure

```
pw-hybrid-framework/
├── playwright.config.ts        # builds a "<module>-setup" + "<module>" project pair per module
├── CODEOWNERS                  # one QA per module
├── src/
│   ├── config/
│   │   ├── modules.ts           # THE module registry — id, route, env-var prefix
│   │   └── env.ts                # TEST_ENV switch (local|dev), shell URL, per-module creds
│   ├── pages/
│   │   ├── base.page.ts          # shared page behavior
│   │   ├── shell/shell-login.page.ts   # Keycloak login (shell-owned, shared by every module)
│   │   ├── crm/crm.page.ts
│   │   ├── mill/mill.page.ts
│   │   └── <module>/<module>.page.ts   # one folder per module
│   ├── api/
│   │   └── base.api-client.ts    # thin wrapper over Playwright's APIRequestContext
│   ├── fixtures/
│   │   ├── auth-setup.ts         # shared login-and-save-storage-state helper
│   │   ├── crm.fixtures.ts       # exposes only `crmPage` — scoped to CRM
│   │   └── <module>.fixtures.ts  # one per module, never shared across modules
│   ├── data/
│   │   └── data-reader.ts        # data-driven test-case loader
│   └── utils/logger.ts
└── tests/
    ├── crm/
    │   ├── auth.setup.ts          # logs in as the CRM test user, caches session
    │   └── crm.spec.ts
    ├── mill/
    │   ├── auth.setup.ts
    │   └── mill.spec.ts
    └── <module>/...               # costing, planning, techpack, master-data, admin, copilot
```

## Setup

```bash
npm install
npx playwright install --with-deps
cp .env.example .env
```

In `.env`, fill in `LOCAL_APP_SHELL_URL` (defaults to `http://localhost:3100`,
the shell's local Vite port from `tilt up` in the floorOS repo) and — for
**your module only** — its `<PREFIX>_USER_LOCAL` / `<PREFIX>_PASSWORD_LOCAL`.
Leave every other module's vars blank; the framework only reads the module
you run. Fill in the `_DEV` variants (and `DEV_APP_SHELL_URL`) once you're
ready to promote to dev.

## Running tests

Local (default — `TEST_ENV=local`), one module:

```bash
npm run test:crm
npm run test:mill
```

Same tests against dev — nothing else changes:

```bash
npm run test:crm:dev
npm run test:mill:dev
```

Everything, one environment:

```bash
npm run test:local     # all 8 modules against local
npm run test:dev       # all 8 modules against dev
```

Other useful flags (compose with any of the above via `--`):

```bash
npm run test:crm -- --headed
npm run test:debug
npm run report
```

> `TEST_ENV=dev npm run test:crm` (inline env var) assumes a POSIX shell
> (macOS/Linux/CI). The `test:*:dev` npm scripts already do this for you.

## The local → dev workflow

1. `tilt up` the floorOS stack locally (see the floorOS repo's quickstart).
2. Run `npm run test:<your-module>` until it's green locally.
3. Fill in that module's `_DEV` credentials, get `DEV_APP_SHELL_URL` from
   your lead, and run `npm run test:<your-module>:dev` — same spec files,
   same page objects, only the target and login changed.
4. Nothing to edit to promote: the switch is `TEST_ENV`, driven entirely
   by which npm script you run.

## Onboarding a new module's QA

The module already exists in `src/config/modules.ts` (all 8 current
floorOS frontends are pre-wired) if you're just picking up ownership:

1. Add your credentials to `.env` under your module's prefix.
2. Open `src/pages/<module>/<module>.page.ts` — it's a smoke-test stub
   (`expectLoaded()` just checks an `<h1>` renders). Replace the `heading`
   locator and add the locators/actions your module actually needs.
3. Write specs in `tests/<module>/`, importing `test`/`expect` from
   `src/fixtures/<module>.fixtures.ts`.
4. Claim your rows in [CODEOWNERS](./CODEOWNERS).

If floorOS ships a genuinely new frontend later, add one entry to
`MODULES` in `src/config/modules.ts`, then repeat steps 1-4 above for it —
`playwright.config.ts` and `package.json` need a matching project/script
pair (copy an existing module's two lines in each).

## Adding an API client

Module tests are UI-first (through the shell), but if a module needs to
hit its backend service directly, add `src/api/<module>.api-client.ts`
extending `BaseApiClient`, wire it into that module's fixtures file, and
consume it from a spec in `tests/<module>/`.

## Adding data-driven cases

Add rows to a JSON file (e.g. `src/data/crm/create-lead.data.json`), type
them, load with `readData<T>()` from `src/data/data-reader.ts`, and loop
over them in the spec to generate one Playwright test per row.

## Extended reporting (Allure)

Every run also collects [Allure](https://allurereport.org) results
(`allure-results/`, gitignored) via `allure-playwright` — richer than
Playwright's own HTML report: tests grouped by Epic/Feature (see the
`allure.epic()`/`allure.feature()`/`allure.owner()` calls in
`tests/crm/create-customer.spec.ts`), a `tms` link on each test straight
back to its ClickUp task, `test.step()` breakdowns, retries, and history
across runs.

```bash
npm run report:allure:generate   # build allure-report/ (static site) from the last run's results
npm run report:allure:open       # regenerate + serve + open in the browser (blocking — Ctrl+C to stop)
```

This uses [Allure 3](https://allurereport.org/blog/allure-report-3/) (the
`allure` npm package — pure Node, no Java required). When adding
ClickUp-backed test cases in a new module, follow the same pattern: an
`allure.tms(url, label)` call per test, `epic`/`feature`/`owner` in a
`test.beforeEach`.

## Lint / format

```bash
npm run lint
npm run format
npm run typecheck
```
