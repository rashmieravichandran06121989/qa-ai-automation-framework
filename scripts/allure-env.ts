#!/usr/bin/env node
// Writes allure-results/environment.properties so the Allure dashboard
// shows git SHA, branch, and Node version at the top of every report.
// CI calls this between `playwright test` and `allure generate`. Works
// locally too — `npx tsx scripts/allure-env.ts`.
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

function safeExec(cmd: string): string {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'unknown (degraded-metadata)';
  }
}

const lines = [
  `Node=${process.version}`,
  `OS=${process.platform}`,
  `GitBranch=${safeExec('git rev-parse --abbrev-ref HEAD')}`,
  `GitCommit=${safeExec('git rev-parse --short HEAD')}`,
  `GitAuthor=${safeExec('git log -1 --pretty=format:%an')}`,
  `BaseURL=${process.env.BASE_URL ?? 'https://www.saucedemo.com'}`,
  `OrangeHRMBaseURL=${process.env.ORANGEHRM_BASE_URL ?? 'https://opensource-demo.orangehrmlive.com'}`,
  `ApiBaseURL=${process.env.API_BASE_URL ?? 'https://jsonplaceholder.typicode.com'}`,
  `VisualAI=${process.env.APPLITOOLS_API_KEY ? 'enabled' : 'disabled'}`,
  `CI=${process.env.CI ? 'true' : 'false'}`,
];

const outDir = join(process.cwd(), 'allure-results');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'environment.properties'), lines.join('\n'));

// eslint-disable-next-line no-console
console.log(
  `[allure-env] wrote ${lines.length} properties to ${outDir}/environment.properties`,
);
