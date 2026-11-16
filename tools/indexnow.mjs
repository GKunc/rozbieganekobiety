#!/usr/bin/env node
// Tells Bing, Yandex and other IndexNow engines which URLs changed.
// Bing's index feeds ChatGPT search and Copilot, so this speeds up AI visibility.
// Usage: node tools/indexnow.mjs [baseCommit]   (no base, or all zeros = submit every sitemap URL)
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { ROOT, SRC, read, sitemapUrls, siteUrl, urlToFile, rel } from './lib.mjs';

const key = read(join(SRC, 'indexnow.txt')).trim();
if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) {
  console.log('No valid IndexNow key in src/indexnow.txt, skipping.');
  process.exit(0);
}

const base = siteUrl();
const urls = sitemapUrls();
const before = process.argv[2];
let changed = urls;
if (before && !/^0+$/.test(before)) {
  try {
    const diff = execFileSync('git', ['diff', '--name-only', before, 'HEAD', '--', 'src'], { cwd: ROOT, encoding: 'utf8' })
      .split('\n').filter(Boolean).map((f) => f.replace(/^src\//, ''));
    changed = urls.filter((u) => {
      const f = urlToFile(u);
      return f && diff.includes(rel(f));
    });
  } catch {
    changed = urls; // base commit not available (e.g. force push): submit everything
  }
}

if (!changed.length) {
  console.log('No sitemap pages changed, nothing to submit.');
  process.exit(0);
}

const body = {
  host: new URL(base).host,
  key,
  keyLocation: base + 'indexnow.txt',
  urlList: changed,
};
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});
console.log(`IndexNow ${res.status} for ${changed.length} URL(s):\n${changed.join('\n')}`);
// 200/202 = accepted. 403/422 usually mean the key file is not live yet; not worth failing a deploy.
if (res.status >= 500) process.exit(1);
