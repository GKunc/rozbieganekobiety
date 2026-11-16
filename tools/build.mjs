#!/usr/bin/env node
// Copies src/ to _site/ for deployment: drops authoring-only files and adds
// <lastmod> to the sitemap from each page's last git commit.
// Usage: node tools/build.mjs [srcDir=src] [outDir=_site]
import { cpSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { ROOT, SRC, read, urlToFile } from './lib.mjs';

const src = resolve(process.argv[2] || SRC);
const out = resolve(process.argv[3] || join(ROOT, '_site'));
const AUTHORING_ONLY = ['blog/_template.html'];

rmSync(out, { recursive: true, force: true });
cpSync(src, out, { recursive: true });
for (const f of AUTHORING_ONLY) rmSync(join(out, f), { force: true });

const today = new Date().toISOString().slice(0, 10);
function lastCommitDate(file) {
  try {
    const dirty = execFileSync('git', ['status', '--porcelain', '--', file], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (dirty) return today;
    const d = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return d || today;
  } catch {
    return today;
  }
}

const sitemapPath = join(out, 'sitemap.xml');
const xml = read(sitemapPath).replace(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>[^<]*<\/lastmod>)?\s*<\/url>/g, (_, loc) => {
  const file = urlToFile(loc.trim(), src);
  const date = file ? lastCommitDate(file) : today;
  return `<url><loc>${loc.trim()}</loc><lastmod>${date}</lastmod></url>`;
});
writeFileSync(sitemapPath, xml);
console.log(`Built ${out}`);
