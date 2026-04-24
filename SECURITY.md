# Security policy

## Reporting a vulnerability

Don't file a public issue for anything security-sensitive. Email the maintainer directly: **rashmie.yuvaraj@arrive.com** with:

- A concise description of the issue and the potential impact
- Steps to reproduce, ideally with a minimal repro
- Your name and (optional) affiliation for acknowledgement

I aim to acknowledge within two business days. Once validated, I'll open a private advisory on GitHub and coordinate disclosure.

## Scope

This repo is a portfolio test framework targeting public demo sites (SauceDemo, OrangeHRM demo, jsonplaceholder). In scope:

- Secret leakage through the committed codebase (scanned in CI via gitleaks)
- Supply-chain risks in `package.json` / `package-lock.json` (scanned via `npm audit` + Dependabot)
- Test-data generation patterns that could embed real PII if misused

Out of scope:

- Vulnerabilities in the third-party demo sites themselves (report those upstream)
- Issues in dependencies that are already tracked in their own advisories

## What's scanned in CI

Every push and PR runs:

- `npm audit --audit-level=high --omit=dev`
- `gitleaks` for committed secrets
- CodeQL for JavaScript / TypeScript vulnerabilities

See `.github/workflows/playwright.yml` → `security` job.
