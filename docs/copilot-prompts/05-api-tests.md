# 05 · API tests (jsonplaceholder.typicode.com)

## Why not SauceDemo, OrangeHRM, or reqres.in

SauceDemo has no public API — it's a browser-only demo. OrangeHRM's REST endpoints rely on UI session cookies and aren't documented or stable enough to point a CI suite at. reqres.in used to be my go-to, but it moved to a paid tier in 2024 and the public demo key started returning 401 on every endpoint partway through this build. I pivoted the whole API layer to [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com) mid-verification — unauthenticated, running since 2013, same REST surface, used in the React/Vue/Angular official tutorials.

## Read-side prompt

```
Write tests/api/users.api.test.ts — Playwright API tests against jsonplaceholder's
read endpoints.

- Use Playwright's native APIRequestContext via the `request` fixture. No axios.
- No auth header — jsonplaceholder is unauthenticated.
- Three tests:
  1. GET /users → 200, array of users, every item has { id, name, username, email,
     address, company } shape.
  2. GET /users/1 → 200, single user with matching id.
  3. GET /users/9999 → 404, empty body.
- Assert both status code AND body shape.
- Group in test.describe('jsonplaceholder — users (read)', …).
```

Three tests on first acceptance. Copilot used `expect.objectContaining(...)` for the list-item shape — the right idiom when you want "these fields exist" without caring about extras. It also picked up the nested `address.city` and `company.name` asserts that make the shape recognizably jsonplaceholder.

## CRUD prompt

```
Write tests/api/users-crud.api.test.ts covering POST, PUT, PATCH, DELETE against
/posts[/:id]. For POST, generate the post title from buildUser().username via
fixtures/data-factory. Assert status + body shape on every test.
```

Two things to re-prompt on. The DELETE test initially asserted `body.success: true` — that's a lazy guess. jsonplaceholder returns 200 with an empty `{}` on DELETE. Fixed by pinning the expected status + empty-body shape in the prompt. The PATCH test only asserted the patched field; I strengthened it to also check the untouched fields (`body`, `userId`) still exist. If jsonplaceholder ever loses that behaviour, it's a real regression, and the strengthened test catches it.

## What I took away

API tests are where Copilot guesses at response shapes the most. Every prompt here spells out the exact status code, the body shape, and any untouched-field invariants. Without that, the first draft asserts fictional payloads that fail the moment you run them. "Assert status code AND body shape" in every prompt is the seatbelt.
