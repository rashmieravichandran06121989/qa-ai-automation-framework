# syntax=docker/dockerfile:1.6
#
# Local + CI test runner. Base image is Microsoft's Playwright image
# pinned to 1.44.0 (jammy) — ships all three browsers and the OS deps,
# so `npx playwright install` is a no-op inside the container.

FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

# `npm ci` over `npm install` so the lockfile is the source of truth.
COPY package.json package-lock.json ./
RUN npm ci

# .dockerignore keeps node_modules, .git, reports, and .env out.
COPY . .

# Default: the full BDD run on chromium. Override via
#   docker compose run --rm tests npm run test:api
CMD ["npm", "run", "test:bdd"]
