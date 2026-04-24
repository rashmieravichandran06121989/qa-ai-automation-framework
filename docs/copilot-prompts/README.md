# Copilot prompt library

Six files, one per layer of the framework. Each documents the prompt I actually sent, what Copilot gave back the first time, what I had to re-prompt for, and the lesson that stuck. This is the committed evidence for Days 5–6 of the Phase 1 plan — the "prompt engineering for test generation, edge cases, and test data" line item.

| File                                                           | What it covers                                               | Layer in the repo                           |
| -------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------- |
| [01-page-objects.md](./01-page-objects.md)                     | POM scaffolding for SauceDemo + OrangeHRM                    | `pages/`                                    |
| [02-feature-files.md](./02-feature-files.md)                   | Gherkin with positive + negative + edge in one shot          | `features/`                                 |
| [03-step-defs.md](./03-step-defs.md)                           | Step defs bound to injected POMs                             | `steps/`                                    |
| [04-test-data.md](./04-test-data.md)                           | Faker builders with override support                         | `fixtures/data-factory.ts`                  |
| [05-api-tests.md](./05-api-tests.md)                           | APIRequestContext tests against jsonplaceholder.typicode.com | `tests/api/`                                |
| [06-applitools-integration.md](./06-applitools-integration.md) | Eyes fixture lifecycle + checkpoint placement                | `applitools.config.ts`, `fixtures/index.ts` |

## Three things I kept re-learning

A conventions file beats raw capability. The same prompt produces wildly different output depending on whether `.github/copilot-instructions.md` already exists. Twenty minutes writing that file saved correction time on every completion after.

These prompts travel. Swap the URL, swap the selector strategy, and the POM prompt produces a working page object for a different target. The feature-file prompt produces the same shape of Gherkin against any app. That's the real artifact — the prompt pattern, not the generated code.

You have to ask for edge cases explicitly. Copilot writes happy-path coverage by default. If the prompt doesn't name the negative and edge angles, you don't get them. Every prompt here names what should break and how.
