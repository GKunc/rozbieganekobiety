#!/usr/bin/env node
// Claude Code hooks (wired in .claude/settings.json). They make the checks unavoidable:
//   node tools/hook.mjs post-edit   after every Edit/Write: the site must still build
//                                   (broken config JSON, unknown partial, bad @vars)
//   node tools/hook.mjs stop        before Claude says it is done: if the site was changed,
//                                   build + release checks + internal links must pass
// Exit code 2 sends the message on stderr back to Claude, which then has to fix the problem.
import { spawnSync } from 'node:child_process';
import { readFileSync, realpathSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { ROOT, SRC, CONFIG, loadConfig, isConfigured } from './lib.mjs';

const mode = process.argv[2];
let input = {};
try { input = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { /* no stdin: run anyway */ }

const node = (script, args) => spawnSync(process.execPath, [script, ...args], { cwd: ROOT, encoding: 'utf8' });
const tail = (r, lines = 40) => ((r.stdout || '') + (r.stderr || '')).trim().split('\n').slice(-lines).join('\n');
const block = (message) => { console.error(message); process.exit(2); };

if (mode === 'post-edit') {
  // Compare real paths: the editor may report the file through a symlink (e.g. /var -> /private/var).
  const real = (p) => { try { return realpathSync(p); } catch { return resolve(p); } };
  const file = input.tool_input?.file_path ? real(input.tool_input.file_path) : '';
  if (file !== real(CONFIG) && !file.startsWith(real(SRC) + sep)) process.exit(0); // emails/ and worker/ are checked by the stop hook
  const r = node('tools/build.mjs', ['.preview-check']);
  spawnSync(process.execPath, ['-e', 'require("fs").rmSync(".preview-check",{recursive:true,force:true})'], { cwd: ROOT });
  if (r.status !== 0) block(`The site no longer builds after this edit. Fix it before doing anything else:\n${tail(r, 10)}`);
  process.exit(0);
}

if (mode === 'stop') {
  if (input.stop_hook_active) process.exit(0); // already asked once this turn; never loop
  try { if (!isConfigured(loadConfig())) process.exit(0); } catch { /* broken config: let verify report it */ }
  const dirty = spawnSync('git', ['status', '--porcelain', '--', 'src', 'site.config.json', 'emails', 'worker'], { cwd: ROOT, encoding: 'utf8' });
  if (dirty.status !== 0 || !dirty.stdout.trim()) process.exit(0); // nothing changed on the site
  const r = node('tools/verify.mjs', ['--quick']);
  if (r.status !== 0) {
    block(`The site has uncommitted changes that fail the release checks (node tools/verify.mjs --quick). Fix these before finishing; if a fix needs facts only the user has, ask them:\n${tail(r)}`);
  }
  process.exit(0);
}

console.error('Usage: node tools/hook.mjs post-edit|stop');
process.exit(1);
