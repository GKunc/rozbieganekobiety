#!/usr/bin/env node
// Tests the template itself: copies the repo to a temp folder (with a space in its name, on purpose),
// fills it with tools/fixture/site.config.json plus one blog post made from blog/_template.html,
// and runs the real tools on it. Run after any change to tools/, src/ structure or the workflow.
// Usage: node tools/selftest.mjs [--lighthouse]
import { spawnSync } from 'node:child_process';
import { cpSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ROOT } from './lib.mjs';

const lighthouse = process.argv.includes('--lighthouse');
const tmp = join(tmpdir(), 'landing template selftest');
const SKIP = new Set(['.git', 'node_modules', '_site', '.preview', '.lighthouseci']);
rmSync(tmp, { recursive: true, force: true });
cpSync(ROOT, tmp, { recursive: true, filter: (p) => !SKIP.has(p.slice(ROOT.length + 1).split(/[\\/]/)[0]) });

const fixture = readFileSync(join(ROOT, 'tools/fixture/site.config.json'), 'utf8');
writeFileSync(join(tmp, 'site.config.json'), fixture);
const post = readFileSync(join(tmp, 'src/blog/_template.html'), 'utf8')
  .replace(/<!-- @vars[\s\S]*?-->/, `<!-- @vars\n${JSON.stringify({
    POST_TITLE: 'How often to water office plants & why',
    POST_DESCRIPTION: 'Fixture post for the template self-test: most office plants need water once a week, less in winter. Here is how to tell.',
    DATE: '2026-01-02',
    CTA_HEADING: 'Rather not think about it?',
    CTA_TEXT: 'We do the watering for you.',
  }, null, 2)}\n-->`)
  .replace('{{POST_BODY}}', '<p>Most office plants need water once a week.</p>\n      <h2>How to tell</h2>\n      <p>Push a finger two centimetres into the soil; water when it is dry.</p>');
writeFileSync(join(tmp, 'src/blog/how-often-to-water.html'), post);

let failed = false;
function run(name, script, args = [], { expectFail = false, env = {} } = {}) {
  console.log(`\n━━ ${name}`);
  const r = spawnSync(process.execPath, [join(tmp, script), ...args], { cwd: tmp, stdio: 'inherit', env: { ...process.env, ...env } });
  const ok = expectFail ? r.status !== 0 : r.status === 0;
  console.log(ok ? `✔ ${name}` : `✘ ${name}${expectFail ? ' (expected a failure, but it passed)' : ''}`);
  if (!ok) failed = true;
}

run('Generate og.png and icons', 'tools/make-assets.mjs');
run('Guard: template filler copy must be rejected', 'tools/check.mjs', [], { expectFail: true });
run('Full verification of the filled template', 'tools/verify.mjs', lighthouse ? ['--lighthouse'] : [], { env: { ALLOW_FILLER: '1' } });

const withConfig = (changes) => writeFileSync(join(tmp, 'site.config.json'), JSON.stringify({ ...JSON.parse(fixture), ...changes }, null, 2));
const OK = { env: { ALLOW_FILLER: '1' } };
const FAILS = { expectFail: true, env: { ALLOW_FILLER: '1' } };

withConfig({ META_DESCRIPTION: '' });
run('Guard: a missing config value must be rejected', 'tools/check.mjs', [], FAILS);
withConfig({ ANALYTICS_ID: 'UA-12345-1' });
run('Guard: an old/invalid analytics id must be rejected', 'tools/check.mjs', [], FAILS);
withConfig({ ANALYTICS: 'matomo' });
run('Guard: an unknown analytics tool must be rejected', 'tools/check.mjs', [], FAILS);
withConfig({ FORM_ENDPOINT: 'http://example.com/form' });
run('Guard: a non-https form endpoint must be rejected', 'tools/check.mjs', [], FAILS);
withConfig({ ANALYTICS_ID: '-----BEGIN PRIVATE KEY-----' });
run('Guard: a secret in the config must be rejected', 'tools/check.mjs', [], FAILS);
for (const [tool, id] of [['plausible', ''], ['goatcounter', 'fixture'], ['cloudflare', '0123456789abcdef0123456789abcdef'], ['none', '']]) {
  withConfig({ ANALYTICS: tool, ANALYTICS_ID: id, FORM_ACCESS_KEY: 'fixture-access-key' });
  run(`Variant: ANALYTICS=${tool} builds and validates`, 'tools/verify.mjs', [], OK);
}
withConfig({});
run('Contact form worker (fake Resend and Turnstile)', 'tools/test-worker.mjs');
writeFileSync(join(tmp, 'emails/autoreply.txt'), readFileSync(join(tmp, 'emails/autoreply.txt'), 'utf8') + '\nYou wrote: {{message}}\n');
run('Guard: an autoreply that echoes the message must be rejected', 'tools/check.mjs', [], FAILS);
writeFileSync(join(tmp, 'emails/autoreply.txt'), readFileSync(join(ROOT, 'emails/autoreply.txt'), 'utf8'));
writeFileSync(join(tmp, 'emails/autoreply.html'), readFileSync(join(ROOT, 'emails/autoreply.html'), 'utf8').replace('<p>', '<p style="color:#ff0000">'));
run('Guard: a colour typed into an email must be rejected', 'tools/check.mjs', [], FAILS);
writeFileSync(join(tmp, 'emails/autoreply.html'), readFileSync(join(ROOT, 'emails/autoreply.html'), 'utf8'));
withConfig({ EMAIL_FROM: '' });
run('Guard: the form worker without a sender address must be rejected', 'tools/check.mjs', [], FAILS);
withConfig({});
run('Google tool (dry run)', 'tools/google.mjs', ['search-console', '--owners', 'owner@example.com', '--dry-run']);
run('Form test (shows what it would send, sends nothing)', 'tools/form-test.mjs');

console.log(failed ? '\nSELFTEST FAILED' : `\nSelftest passed (${tmp})`);
process.exit(failed ? 1 : 0);
