# Test cases

Human-readable test case documentation, one folder per module and one file
per user story — kept separate from `tests/` on purpose:

- **`tests/`** is the automation: Playwright specs, one file per Playwright
  `test()`, written for the runner.
- **`test-cases/`** is the source record: what a test case verifies, its
  steps and expected result, where it came from (ClickUp), and whether
  it's automated yet — written for a human, reviewable without opening
  Playwright or ClickUp.

A test case here should always link back to its ClickUp task, and forward
to the spec file that automates it (once automated).

## Structure

```
test-cases/
└── <module>/
    └── <user-story-slug>.md   # one file per user story, all its test cases inside
```

## Adding a test case

1. Add a row to the relevant `test-cases/<module>/<story>.md` (create the
   file, following the format in an existing one, if this is a new story).
2. Automate it as a `test()` in the matching `tests/<module>/*.spec.ts`.
3. Flip that row's "Automated" column to a link to the spec.

Keeping these in sync is manual — there's no code generation between
them — but it's the one place a PM or QA lead can see coverage at a
glance without opening the automation code.
