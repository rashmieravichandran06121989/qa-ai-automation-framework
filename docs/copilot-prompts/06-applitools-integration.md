# 06 · Applitools Eyes integration

## The prompt

```
Add an `eyes` fixture to fixtures/index.ts that wraps Applitools lifecycle per
playwright-bdd scenario.

- eyes.check(name, target?) is the only public method. Default target is
  Target.window().fully().
- eyes.check() is a no-op when APPLITOOLS_API_KEY is missing (visualEnabled is false).
  Scenarios call it unconditionally — no `if (visualEnabled)` guards in step defs.
- Lazy open: the Eyes session opens on the first .check() of a scenario. A scenario
  with zero .check() calls creates zero sessions.
- Use buildEyesConfig() from applitools.config.ts — never instantiate a fresh
  Configuration.
- testInfo.title becomes the Eyes test name so the dashboard maps back to the scenario.
- Teardown via the fixture's async boundary. Use eyes.close(false) so visual diffs
  don't throw — the CI-level Applitools gate handles unresolved diffs at the batch
  level. Swallow close() errors with a console.warn so a transient Applitools blip
  doesn't fail the run.
```

First draft produced an `EyesSession` class with `check()` + `close()` methods, a `VisualGridRunner` wired at `testConcurrency: 5` (matches the local Playwright worker count), and the `eyes` fixture registered with teardown after `await use(session)`.

Two things needed fixing. The first draft tried to hook teardown onto `page.once('close', ...)` — that's fire-and-forget, and the fixture teardown can't `await` it, so Eyes sessions were leaking. I rewrote the teardown to live on the fixture boundary itself (`await session.close()` after `await use(session)`). The second draft called `eyes.close(true)` which throws on unresolved diffs — wrong for this setup. Swapped to `close(false)` so the diff state lands in the dashboard and the CI gate is what actually blocks merges.

## Checkpoint naming

Every `eyes.check()` uses the pattern `"<Target> — <context>"`. Examples:

- `"SauceDemo — inventory after login"`
- `"SauceDemo — order complete"`
- `"OrangeHRM — dashboard after login"`
- `"OrangeHRM — personal details after add employee"`

The Applitools dashboard sorts by test name, so this convention groups checkpoints by target when the batch grows past a few dozen.

## What I took away

Visual testing is two layers, not one. The fixture owns the lifecycle. The step def fires the checkpoint. Keep guards and cleanup out of step definitions — they belong in the fixture. Step defs stay single-line (`await eyes.check('...')`) and adding or removing Applitools later touches exactly one file. That's the whole architectural bet, and it's paid off every time I've had to rework visual coverage.
