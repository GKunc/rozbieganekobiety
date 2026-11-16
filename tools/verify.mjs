#!/usr/bin/env node
// Runs the same checks as CI, locally, so problems show up before a push.
// Usage: node tools/verify.mjs [--quick] [--lighthouse]
//   default      release checks -> build _site -> HTML validation -> internal links
//   --quick      release checks -> build -> internal links (offline, a few seconds; used by the pre-push hook)
//   --lighthouse also runs Lighthouse with the CI budgets (needs Chrome, ~1-2 min)
import { spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { ROOT, walk, read } from './lib.mjs';

const args = new Set(process.argv.slice(2));
const quick = args.has('--quick');
const lighthouse = args.has('--lighthouse');
const SITE = join(ROOT, '_site');
// Keep these in step with .github/workflows/pages.yml
const HTML_VALIDATE = 'html-validate@11.21.1';
const LHCI = '@lhci/cli@0.16.1';

const results = [];
function step(name, fn) {
  process.stdout.write(`\n▶ ${name}\n`);
  const t = Date.now();
  let ok;
  try { ok = fn() !== false; } catch (e) { console.error(e.message); ok = false; }
  results.push({ name, ok, s: ((Date.now() - t) / 1000).toFixed(1) });
  if (!ok) finish();
}
function run(cmd, cmdArgs) {
  const r = spawnSync(cmd, cmdArgs, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
  return r.status === 0;
}
function finish() {
  console.log('\n──────── summary ────────');
  for (const r of results) console.log(`${r.ok ? '✔' : '✘'} ${r.name} (${r.s}s)`);
  const failed = results.some((r) => !r.ok);
  console.log(failed ? '\nFAILED: fix the step above before pushing.' : '\nAll good: this would pass CI.');
  process.exit(failed ? 1 : 0);
}

/** Offline internal link check over _site (what lychee --offline does in CI). */
function checkLinks() {
  const bad = [];
  const pages = walk(SITE).filter((p) => p.endsWith('.html'));
  for (const page of pages) {
    const html = read(page).replace(/<!--[\s\S]*?-->/g, '');
    for (const m of html.matchAll(/\s(?:href|src|srcset|poster)\s*=\s*["']([^"']+)["']/gi)) {
      for (let url of m[1].split(',').map((s) => s.trim().split(/\s+/)[0])) {
        if (!url || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url) || url.includes('{{')) continue;
        url = url.split(/[?#]/)[0];
        if (!url) continue;
        let target;
        try { target = url.startsWith('/') ? join(SITE, decodeURI(url)) : resolve(dirname(page), decodeURI(url)); } catch { bad.push(`${page}: bad URL ${url}`); continue; }
        if (!target.startsWith(SITE)) continue; // /<repo>/ style links outside the build root
        if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
        if (!existsSync(target)) bad.push(`${page.slice(SITE.length + 1)} -> ${url}`);
      }
    }
  }
  if (bad.length) { console.error(`Broken internal links (${bad.length}):\n  ` + bad.join('\n  ')); return false; }
  console.log(`${pages.length} pages, no broken internal links.`);
}

step('Release checks (tools/check.mjs)', () => run(process.execPath, ['tools/check.mjs']));
step('Build _site (tools/build.mjs)', () => run(process.execPath, ['tools/build.mjs']));
if (!quick) step('HTML validation', () => run('npx', ['--yes', HTML_VALIDATE, '_site/**/*.html']));
step('Internal links', checkLinks);
if (lighthouse) step('Lighthouse (CI budgets)', () => run('npx', ['--yes', LHCI, 'autorun']));
if (!quick && !lighthouse) console.log('\n(Lighthouse skipped; add --lighthouse to run it like CI does.)');
finish();
