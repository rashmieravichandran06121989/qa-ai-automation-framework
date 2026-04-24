# Screenshots

The main README references seven screenshots from this folder. Capture them after a clean local run, save with the exact filenames below, and they'll render inline in the README.

## Capture checklist

| #   | File                          | How to capture                                                                                                                      |
| --- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `01-vscode-project.png`       | `code .` from the repo root. Expand the file tree so `features/`, `pages/`, and `tests/` are all visible. Full window.              |
| 2   | `02-vscode-test-run.png`      | Run `npm run test:bdd` in VSCode's terminal. Capture the terminal pane + Test Explorer while the list is still green.               |
| 3   | `03-playwright-report.png`    | After a run, `npx playwright show-report` opens the Playwright HTML report. Shoot the suite overview.                               |
| 4   | `04-applitools-dashboard.png` | Log in to eyes.applitools.com after a run with `APPLITOOLS_API_KEY` set. Capture the most recent batch showing all browser tiles.   |
| 5   | `05-applitools-diff.png`      | Introduce a tiny CSS change against the SauceDemo visual baseline, rerun. Capture the unresolved diff view. This is the money shot. |
| 6   | `06-copilot-suggestion.png`   | Start typing a new step def in VSCode with Copilot enabled. Capture the ghost-text mid-suggestion.                                  |
| 7   | `07-ci-run.png`               | Push a commit. Grab the passing Actions run with the matrix jobs expanded.                                                          |

## Quick capture tips

Use a 1280×720 viewport or larger — matches the Playwright config, so anything you shoot lines up with what CI runs. Crop tight before saving, no dead whitespace. On macOS, `Cmd+Shift+4` then space captures a single window cleanly. PNG over JPG for any UI text — keeps edges crisp.
