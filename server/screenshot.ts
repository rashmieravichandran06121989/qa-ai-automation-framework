/**
 * Screenshot router — launches a Playwright browser, navigates to a URL,
 * captures a screenshot, saves it locally, and returns a URL the frontend
 * can preview and use as evidence.
 *
 * POST /screenshots/capture
 *   Body: { url, selector?, filename?, headless?, fullPage? }
 *   Returns: { filename, localPath, serverUrl, capturedAt }
 */

import { Router } from 'express';
import path from 'path';
import fs from 'fs';

export const screenshotRouter = Router();

const FRAMEWORK_ROOT = path.resolve(__dirname, '..');

export function screenshotDir(): string {
  return path.resolve(
    FRAMEWORK_ROOT,
    process.env.SCREENSHOT_DIR || 'playwright-report/evidence',
  );
}

export function ensureScreenshotDir(): void {
  const dir = screenshotDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function sanitizeFilename(name: string): string {
  return (
    (name || `screenshot-${Date.now()}`)
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 120) || `screenshot-${Date.now()}`
  );
}

interface CaptureBody {
  url: string;
  selector?: string;
  filename?: string;
  headless?: boolean;
  fullPage?: boolean;
  waitMs?: number;
}

screenshotRouter.post('/capture', async (req, res) => {
  const body = req.body as CaptureBody;
  if (!body?.url || !/^https?:\/\//.test(body.url)) {
    res
      .status(400)
      .json({ error: 'Request must include a valid http(s) "url".' });
    return;
  }

  // Lazy-require Playwright so the server doesn't fail to start if it's
  // somehow not installed — the error will surface only when you actually
  // try to capture a screenshot.
  let chromium;
  try {
    ({ chromium } = await import('@playwright/test'));
  } catch {
    res
      .status(500)
      .json({
        error:
          'Playwright not available. Run `npx playwright install` in the framework root.',
      });
    return;
  }

  const headless =
    body.headless !== undefined
      ? body.headless
      : (process.env.SCREENSHOT_HEADLESS ?? 'true').toLowerCase() === 'true';

  const filename =
    sanitizeFilename(body.filename || `shot-${Date.now()}.png`).replace(
      /\.(png|jpg|jpeg|webp)?$/i,
      '',
    ) + '.png';
  const outPath = path.join(screenshotDir(), filename);

  let browser;
  try {
    browser = await chromium.launch({ headless });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();
    await page.goto(body.url, { waitUntil: 'networkidle', timeout: 30000 });
    if (body.waitMs && body.waitMs > 0) await page.waitForTimeout(body.waitMs);

    if (body.selector) {
      const el = await page.$(body.selector);
      if (!el) {
        throw new Error(`Selector not found on page: ${body.selector}`);
      }
      await el.screenshot({ path: outPath });
    } else {
      await page.screenshot({
        path: outPath,
        fullPage: body.fullPage !== false,
      });
    }

    const port = process.env.PORT || '3100';
    res.json({
      filename,
      localPath: outPath,
      serverUrl: `http://localhost:${port}/evidence/${filename}`,
      capturedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: `Screenshot failed: ${err.message}` });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
});

/** List previously captured screenshots (handy for a future gallery). */
screenshotRouter.get('/list', (_req, res) => {
  const dir = screenshotDir();
  if (!fs.existsSync(dir)) {
    res.json({ files: [] });
    return;
  }
  const port = process.env.PORT || '3100';
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort(
      (a, b) =>
        fs.statSync(path.join(dir, b)).mtimeMs -
        fs.statSync(path.join(dir, a)).mtimeMs,
    )
    .map((f) => ({
      filename: f,
      serverUrl: `http://localhost:${port}/evidence/${f}`,
      sizeBytes: fs.statSync(path.join(dir, f)).size,
      modifiedAt: fs.statSync(path.join(dir, f)).mtime.toISOString(),
    }));
  res.json({ files });
});
