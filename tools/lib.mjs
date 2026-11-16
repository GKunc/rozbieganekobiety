// Shared helpers for the repo tooling. Node 20+, no dependencies.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export const ROOT = new URL('..', import.meta.url).pathname;
export const SRC = join(ROOT, 'src');

export function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

/** Path relative to src/, always with forward slashes. */
export const rel = (p, base = SRC) => relative(base, p).split(sep).join('/');
export const read = (p) => readFileSync(p, 'utf8');

/** All <loc> URLs in a sitemap. */
export function sitemapUrls(dir = SRC) {
  const xml = read(join(dir, 'sitemap.xml'));
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

/** The home URL (first sitemap entry), always ending in "/". */
export function siteUrl(dir = SRC) {
  const home = sitemapUrls(dir)[0];
  return home && (home.endsWith('/') ? home : home + '/');
}

/** Map a public URL to its source file under dir, or null if it is not on this site. */
export function urlToFile(url, dir = SRC) {
  const base = siteUrl(dir);
  if (!url.startsWith(base)) return null;
  let path = decodeURI(url.slice(base.length).split(/[?#]/)[0]);
  if (path === '' || path.endsWith('/')) path += 'index.html';
  const file = join(dir, path);
  return existsSync(file) ? file : null;
}

/** Map a source file (relative to src/) to its public URL. */
export function fileToUrl(relPath, dir = SRC) {
  const base = siteUrl(dir);
  if (relPath === 'index.html') return base;
  if (relPath.endsWith('/index.html')) return base + relPath.slice(0, -'index.html'.length);
  return base + relPath;
}
