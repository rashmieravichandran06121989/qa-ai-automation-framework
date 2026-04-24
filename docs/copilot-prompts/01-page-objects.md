# 01 · Page Object Models

## The SauceDemo prompt

```
Write a TypeScript Page Object Model for the login page of https://www.saucedemo.com.
Extend `BasePage` from `../base-page`. Declare all locators as `readonly` class
properties using `page.locator('[data-test="..."]')` — no CSS classes, no XPath.
Methods: open(), loginAs(username, password), getErrorMessage(). Return Promise<void>
for actions, Promise<string> for getters. Use async/await throughout.
```

First draft landed clean because `.github/copilot-instructions.md` was already in the repo. All four locators were right, the constructor order was right (`super(page)` → assignments), the method signatures matched the contract. Copilot also slipped a `waitForVisible(this.loginButton)` into `open()` — I took it.

Before the conventions file existed, the same prompt produced `.login-button` CSS classes and a shuffled constructor. The file is what made the difference.

## The OrangeHRM prompt

OrangeHRM doesn't expose `data-test`, so the prompt swaps the primitive:

```
Write a TypeScript Page Object Model for the login page of
https://opensource-demo.orangehrmlive.com. Extend `BasePage`. Do not use data-test —
OrangeHRM doesn't expose it. Use page.getByPlaceholder('Username'),
page.getByPlaceholder('Password'), and page.getByRole('button', { name: 'Login' }).
Avoid CSS classes and XPath. Methods: open(), loginAs(username, password),
getErrorMessage(), getRequiredFieldErrorCount().
```

Copilot picked up the `ORANGEHRM_BASE_URL` import from `playwright.config.ts` without being asked — it saw the import referenced in `fixtures/index.ts` and inferred the pattern.

First draft used `page.locator('input[name="username"]')` — a CSS attribute selector, not the ARIA primitive I wanted. Re-prompting with the exact selector name fixed it. I also had to accept a tradeoff on the error alert: `.oxd-alert-content-text` is a generated class name, but OrangeHRM doesn't expose a stable hook for it, and the class has held steady across 2024+ releases. Noted that in the code comment so the next maintainer knows it was deliberate.

## What I took away

Name the primitive in the prompt. "Use `getByRole` / `getByPlaceholder`" produces the primitive. Vague guidance like "prefer ARIA selectors" produces CSS. That's the whole lesson.
