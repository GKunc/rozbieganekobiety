#!/usr/bin/env node
// The one command that decides whether the site may ship. CI runs exactly this (with --lighthouse).
// Usage: node tools/verify.mjs [--quick] [--lighthouse] [--if-configured]
//   default          build + release checks -> HTML validation -> internal links
//   --quick          build + release checks -> internal links (offline, about a second; pre-push and Stop hooks)
//   --lighthouse     also runs Lighthouse with the budgets in lighthouserc.json (needs Chrome, 1-2 min)
//   --if-configured  do nothing while the repo is still the untouched template (used by hooks)
import { spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { ROOT, OUT, HTML_VALIDATE, LHCI, walk, read, loadConfig, isConfigured } from './lib.mjs';

const args = new Set(process.argv.slice(2));
const quick = args.has('--quick');
const lighthouse = args.has('--lighthouse');

if (args.has('--if-configured')) {
  let configured = true;
  try { configured = isConfigured(loadConfig()); } catch { /* a broken config is a real failure: fall through */ }
  if (!configured) {
    console.log('Template not configured yet (BRAND is empty in site.config.json); nothing to verify.');
    process.exit(0);
  }
}

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

/** Every local href/src in the built site must point at a file that exists. */
function checkLinks() {
  const bad = [];
  const pages = walk(OUT).filter((p) => p.endsWith('.html'));
  let base = '';
  try { base = String(loadConfig().SITE_URL || '').replace(/\/+$/, '') + '/'; } catch { /* reported by check.mjs */ }
  for (const page of pages) {
    const html = read(page).replace(/<!--[\s\S]*?-->/g, '');
    for (const m of html.matchAll(/\s(?:href|src|srcset|poster)\s*=\s*["']([^"']+)["']/gi)) {
      for (let url of m[1].split(',').map((s) => s.trim().split(/\s+/)[0])) {
        if (!url) continue;
        // Absolute links to this site (404.html, canonicals) are checked like local ones.
        if (base.length > 1 && url.startsWith(base)) url = '/' + url.slice(base.length);
        else if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url)) continue;
        url = url.split(/[?#]/)[0];
        if (!url) continue;
        let target;
        try { target = url.startsWith('/') ? join(OUT, decodeURI(url)) : resolve(dirname(page), decodeURI(url)); } catch { bad.push(`${page}: bad URL ${url}`); continue; }
        if (!target.startsWith(OUT)) { bad.push(`${page.slice(OUT.length + 1)} -> ${url} (points outside the site)`); continue; }
        if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
        if (!existsSync(target)) bad.push(`${page.slice(OUT.length + 1)} -> ${url}`);
      }
    }
  }
  if (bad.length) { console.error(`Broken internal links (${bad.length}):\n  ` + bad.join('\n  ')); return false; }
  console.log(`${pages.length} pages, no broken internal links.`);
}

step('Build and release checks (tools/check.mjs)', () => run(process.execPath, ['tools/check.mjs']));
if (!quick) step('HTML validation', () => run('npx', ['--yes', HTML_VALIDATE, '_site/**/*.html']));
step('Internal links', checkLinks);
if (lighthouse) step('Lighthouse (budgets in lighthouserc.json)', () => run('npx', ['--yes', LHCI, 'autorun']));
if (!quick && !lighthouse) console.log('\n(Lighthouse skipped; add --lighthouse to run it like CI does.)');
finish();
