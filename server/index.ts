/**
 * QA Agent Server — Phase 2 backend for QAAgent.html
 *
 * Starts a local Express service on 127.0.0.1:PORT that the browser app
 * talks to for features the browser can't do itself:
 *   - Real JIRA fetch + comment post (CORS + auth)
 *   - Run Playwright automation against generated feature files (process spawn)
 *   - Capture evidence screenshots (Playwright browser launch)
 *
 * Security model:
 *   - Listens only on 127.0.0.1, never 0.0.0.0 — unreachable from other machines
 *   - CORS restricted to localhost and file:// origins
 *   - Atlassian token lives in .env, never sent to the browser
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';

import { jiraRouter, isJiraConfigured } from './jira';
import { automationRouter } from './automation';
import { screenshotRouter, ensureScreenshotDir } from './screenshot';
import { isLLMConfigured } from './step-generator';

// Load .env from the framework root (parent of server/)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const PORT = parseInt(process.env.PORT || '3100', 10);
const app = express();

// ── Middleware ──
app.use(express.json({ limit: '1mb' }));
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow: no origin (curl, same-origin file://), localhost any port, 127.0.0.1, file://
      if (!origin) return cb(null, true);
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
        return cb(null, true);
      if (origin.startsWith('file://')) return cb(null, true);
      if (origin === 'null') return cb(null, true); // Chrome sends "null" for file:// sometimes
      return cb(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: false,
  }),
);

// Request logging — compact, one line per request
app.use((req, _res, next) => {
  const t = new Date().toISOString().slice(11, 19);
  console.log(`[${t}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ──

// Health + capability probe — the frontend pings this on load to show the green status dot
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.1.0',
    capabilities: {
      jira: isJiraConfigured(),
      automation: true,
      screenshots: true,
      aiStepImpl: isLLMConfigured(),
    },
    aiProvider: process.env.ANTHROPIC_API_KEY
      ? 'anthropic'
      : process.env.GOOGLE_API_KEY
        ? 'gemini'
        : null,
    jiraBaseUrl: isJiraConfigured() ? process.env.JIRA_BASE_URL : null,
  });
});

app.use('/jira', jiraRouter);
app.use('/automation', automationRouter);
app.use('/screenshots', screenshotRouter);

// Serve captured evidence screenshots as static files so the frontend can preview them
const screenshotDir = path.resolve(
  __dirname,
  '..',
  process.env.SCREENSHOT_DIR || 'playwright-report/evidence',
);
app.use('/evidence', express.static(screenshotDir));

// ── Error handler ──
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[error]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── Startup ──
(async () => {
  ensureScreenshotDir();
  app.listen(PORT, '127.0.0.1', () => {
    console.log(
      '\n═══════════════════════════════════════════════════════════',
    );
    console.log('  QA Agent Server running on http://127.0.0.1:' + PORT);
    console.log('═══════════════════════════════════════════════════════════');
    console.log(
      '  JIRA:          ' +
        (isJiraConfigured()
          ? `✓ connected to ${process.env.JIRA_BASE_URL}`
          : '✗ not configured (set ATLASSIAN_EMAIL + ATLASSIAN_TOKEN in .env)'),
    );
    console.log('  Automation:    ✓ ready');
    console.log(
      '  AI steps:      ' +
        (isLLMConfigured()
          ? `✓ ${process.env.ANTHROPIC_API_KEY ? 'Anthropic Claude' : 'Google Gemini'} configured`
          : '✗ not configured (set ANTHROPIC_API_KEY or GOOGLE_API_KEY in .env)'),
    );
    console.log('  Screenshots:   ✓ ready → ' + screenshotDir);
    console.log(
      '\n  Open QAAgent.html in your browser. It will connect automatically.',
    );
    console.log('  Press Ctrl+C to stop.\n');
  });
})().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
