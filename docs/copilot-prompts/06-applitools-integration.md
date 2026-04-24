# 06 · Applitools Eyes integration

## The prompt

```
Add an `eyes` fixture to fixtures/index.ts that wraps Applitools lifecycle per
playwright-bdd scenario.

- eyes.check(name, target?) is the only public method. Default target is
  Target.window().fully().
- eyes.check() is a no-op when APPLITOOLS_API_KEY is missing (visualEnabled is
  false). Scenarios call it unconditionally — no `if (visualEnabled)` guards
  in step defs.
- Lazy open: the Eyes session opens on the first .check() of a scenario. A
  scenario with zero .check() calls creates zero sessions.
- Use buildEyesConfig() from applitools.config.ts — never instantiate a fresh
  Configuration.
- testInfo.title becomes the Eyes test name so the dashboard maps back to
  the scenario.
- Teardown via the fixture's async boundary. Use eyes.close(false) so visual
  diffs don't throw — unresolved diffs land in the Applitools dashboard, not
  the scenario assertions.
```

## What Copilot produced

- A per-scenario Eyes session with lazy open on first `check()`.
- `VisualGridRunner` instantiated inside the fixture, `Eyes` constructed
  against it, `buildEyesConfig()` applied.
- Teardown via the fixture's `async` boundary — `eyes.close(false).catch(...)`
  after `await use(wrapper)`.

## Iterations needed

- First draft called `eyes.close(true)` which throws on diff. Swapped to
  `close(false)` so the diff state lands in the dashboard and tests don't
  go red for a reason the CI gate already handles.
- First draft wrapped the dynamic import + body in one try/catch, which
  caused body errors to re-run via the catch branch. Narrowed the catch
  to only the close call.

## Checkpoint naming convention

Every `.check()` uses the pattern `"<Target> — <scenario context>"`:

- `"SauceDemo — inventory after login"`
- `"SauceDemo — order complete"`
- `"OrangeHRM — dashboard after login"`
- `"OrangeHRM — personal details after add employee"`

This lets the Applitools dashboard group checkpoints by target once batches
grow past a few dozen.

## What I took away

Visual testing is two layers. The fixture owns the lifecycle. The step def
fires the checkpoint. Keep guards and cleanup out of step definitions —
they belong in the fixture. Step defs stay single-line (`await eyes.check('...')`)
and adding or removing Applitools later touches exactly one file.
