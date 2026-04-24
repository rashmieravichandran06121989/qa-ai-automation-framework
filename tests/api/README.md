# API test layer

## Why jsonplaceholder

SauceDemo is browser-only — no public API to point at. OrangeHRM's REST endpoints need UI session cookies, aren't documented, and get wiped every few hours, so they're out. reqres.in was my first pick, but it moved to a paid tier in 2024 and the public demo key returns 401 on every endpoint now. I found that out partway through verification and pivoted the whole layer to [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com).

jsonplaceholder has been running since 2013. It's unauthenticated, it accepts writes and echoes them back without persisting, and it's the API layer used in the React/Vue/Angular tutorials. Good enough for contract testing — which is all this layer is claiming to do.

## What's in here

| File                     | Endpoints                                | Cases                                          |
| ------------------------ | ---------------------------------------- | ---------------------------------------------- |
| `users.api.test.ts`      | `GET /users`, `GET /users/:id`           | List, single, 404                              |
| `users-crud.api.test.ts` | `POST/PUT/PATCH/DELETE /posts[/:id]`     | Full write lifecycle                           |
| `auth.api.test.ts`       | `GET /users/:id`, `GET /users/:id/posts` | Shape asserts that mirror a real auth response |

Everything runs through Playwright's native `APIRequestContext` via the `api` project in `playwright.config.ts`. No axios, no node-fetch, no separate HTTP client. Fewer deps, fewer things to break.

## Pointing at a real API at work

Swap `API_BASE_URL` and add an `extraHTTPHeaders` block with your bearer token to the `api` project in `playwright.config.ts`. That's the whole change.

## Run it

```bash
npm run test:api            # ~5 seconds, no browser
npm run test:api:verbose    # same, with the list reporter
```
