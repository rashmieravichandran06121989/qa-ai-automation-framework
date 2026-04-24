#!/usr/bin/env node
// Writes allure-results/environment.properties so the Allure dashboard
// shows git SHA, branch, and Node version at the top of every report.
// CI calls this between `playwright test` and `allure generate`. Works
// locally too — `npx tsx scripts/allure-env.ts`.
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { env, visualEnabled } from '../config/env';

function safeExec(cmd: string): string {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    // Tag the report with a marker so readers see metadata was degraded
    // instead of quietly assuming `unknown` means "not on a branch."
    return 'unknown (degraded-metadata)';
  }
}

const lines = [
  `Node=${process.version}`,
  `OS=${process.platform}`,
  `GitBranch=${safeExec('git rev-parse --abbrev-ref HEAD')}`,
  `GitCommit=${safeExec('git rev-parse --short HEAD')}`,
  `GitAuthor=${safeExec('git log -1 --pretty=format:%an')}`,
  `BaseURL=${env.BASE_URL}`,
  `OrangeHRMBaseURL=${env.ORANGEHRM_BASE_URL}`,
  `ApiBaseURL=${env.API_BASE_URL}`,
  `VisualAI=${visualEnabled ? 'enabled' : 'disabled'}`,
  `CI=${env.CI ? 'true' : 'false'}`,
];

const outDir = join(process.cwd(), 'allure-results');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'environment.properties'), lines.join('\n'));

// eslint-disable-next-line no-console
console.log(
  `[allure-env] wrote ${lines.length} properties to ${outDir}/environment.properties`,
);
