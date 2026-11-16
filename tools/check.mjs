#!/usr/bin/env node
// Release checks for the site. Usage: node tools/check.mjs [siteDir=src]
// Exits 1 on any error. Warnings are printed but do not fail.
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { SRC, walk, rel, read, sitemapUrls, siteUrl, urlToFile } from './lib.mjs';

const dir = resolve(process.argv[2] || SRC);
const errors = [];
const warnings = [];
const err = (f, m) => errors.push(`${f}: ${m}`);
const warn = (f, m) => warnings.push(`${f}: ${m}`);

const TEXT_EXT = /\.(html|xml|txt|js|css|json|webmanifest|svg|md)$/;
const SKIP = new Set(['blog/_template.html']);
const FILLER = [
  'Benefit one', 'Benefit two', 'Benefit three', 'Describe the outcome, not the feature',
  'Replace with a real testimonial', 'Name, Role', 'Question one?', 'Answer one.',
];
const REQUIRED = [
  'index.html', '404.html', 'privacy.html', 'robots.txt', 'sitemap.xml', 'llms.txt',
  'site.webmanifest', 'favicon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png',
  'og.png', 'indexnow.txt', 'blog/index.html', 'blog/feed.xml',
];

const files = walk(dir).map((p) => ({ p, r: rel(p, dir) })).filter(({ r }) => !SKIP.has(r));
const html = files.filter(({ r }) => r.endsWith('.html'));

// 1. Required files
for (const f of REQUIRED) if (!existsSync(join(dir, f))) err(f, 'missing (run node tools/make-assets.mjs for images)');

// 2. Placeholders, filler copy, TODO markers
for (const { p, r } of files) {
  if (!TEXT_EXT.test(r)) continue;
  const text = read(p);
  const ph = text.match(/\{\{[A-Z0-9_]+\}\}/g);
  if (ph) err(r, `unfilled placeholders ${[...new Set(ph)].join(', ')}`);
  if (/\.(svg|xml)$/.test(r) && /<!--(?:(?!-->)[\s\S])*?--(?!>)/.test(text)) err(r, 'XML comment contains "--" (breaks the file)');
  if (r.endsWith('.html')) {
    for (const s of FILLER) if (text.includes(s)) err(r, `template filler text "${s}"`);
    if (/\bTODO\b/.test(text.replace(/<!--[\s\S]*?-->/g, ''))) err(r, 'visible TODO marker');
  }
}

// 3. Per-page HTML checks
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, 'i'))?.[1];
const metaContent = (text, key) => {
  for (const tag of text.match(/<meta\b[^>]*>/gi) || []) {
    if (attr(tag, 'name') === key || attr(tag, 'property') === key) return attr(tag, 'content');
  }
};
const indexable = [];

for (const { p, r } of html) {
  const text = read(p).replace(/<!--[\s\S]*?-->/g, '');
  const noindex = /noindex/i.test(metaContent(text, 'robots') || '');
  if (!noindex) indexable.push(r);

  if (!/<html[^>]*\slang="[a-z]{2}(-[A-Za-z]{2})?"/.test(text)) err(r, '<html> needs a valid lang');
  const h1 = text.match(/<h1\b/gi) || [];
  if (h1.length !== 1) err(r, `expected exactly one <h1>, found ${h1.length}`);

  const title = strip(text.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '');
  if (!title) err(r, 'missing <title>');
  else if (!noindex && (title.length < 25 || title.length > 65)) warn(r, `title is ${title.length} chars (aim for 30-60)`);

  const desc = metaContent(text, 'description');
  if (!desc) err(r, 'missing meta description');
  else if (desc.length > 160) err(r, `meta description is ${desc.length} chars (max 160)`);
  else if (!noindex && desc.length < 70) warn(r, `meta description is only ${desc.length} chars`);

  if (!noindex) {
    const canon = text.match(/<link[^>]*rel="canonical"[^>]*>/i)?.[0];
    const href = canon && attr(canon, 'href');
    if (!href) err(r, 'missing canonical link');
    else if (!/^https:\/\//.test(href)) err(r, `canonical must be an absolute https URL (${href})`);
    else if (urlToFile(href, dir) !== p) err(r, `canonical ${href} does not point to this file`);
    if (!metaContent(text, 'og:image') && r !== 'privacy.html') warn(r, 'no og:image');
  }

  for (const img of text.match(/<img\b[^>]*>/gi) || []) {
    if (attr(img, 'alt') === undefined) err(r, `<img> without alt: ${img.slice(0, 80)}`);
    if (!attr(img, 'width') || !attr(img, 'height')) err(r, `<img> needs width and height (layout shift): ${img.slice(0, 80)}`);
  }

  // JSON-LD must parse; FAQPage must mirror the visible FAQ
  const blocks = [...text.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  for (const [, json] of blocks) {
    let data;
    try { data = JSON.parse(json); } catch (e) { err(r, `invalid JSON-LD: ${e.message}`); continue; }
    const nodes = [data, ...(data['@graph'] || [])];
    for (const n of nodes) {
      if (n['@type'] !== 'FAQPage') continue;
      const ld = (n.mainEntity || []).map((q) => q.name.trim()).sort();
      const visible = [...text.matchAll(/<summary>([\s\S]*?)<\/summary>/gi)].map((m) => strip(m[1])).sort();
      if (JSON.stringify(ld) !== JSON.stringify(visible)) err(r, 'FAQPage JSON-LD questions differ from the visible <summary> questions');
    }
    if (nodes.some((n) => Array.isArray(n.sameAs) && n.sameAs.length === 0)) warn(r, 'Organization.sameAs is empty (add social profiles if any)');
  }
}

// 4. Sitemap <-> pages, blog post wiring
if (existsSync(join(dir, 'sitemap.xml'))) {
  const urls = sitemapUrls(dir);
  const base = siteUrl(dir);
  if (!base || !/^https:\/\//.test(base)) err('sitemap.xml', 'first <loc> must be the https home URL');
  const listed = new Set();
  for (const u of urls) {
    const f = urlToFile(u, dir);
    if (!f) err('sitemap.xml', `${u} does not map to a file in the site`);
    else listed.add(rel(f, dir));
  }
  for (const r of indexable) if (!listed.has(r)) err('sitemap.xml', `indexable page ${r} is not listed`);
  if (existsSync(join(dir, 'robots.txt')) && !read(join(dir, 'robots.txt')).includes(`Sitemap: ${base}sitemap.xml`)) {
    err('robots.txt', 'Sitemap line does not match the site URL');
  }

  const posts = html.map(({ r }) => r).filter((r) => /^blog\/[^/]+\.html$/.test(r) && r !== 'blog/index.html');
  const blogIndex = existsSync(join(dir, 'blog/index.html')) ? read(join(dir, 'blog/index.html')) : '';
  const feed = existsSync(join(dir, 'blog/feed.xml')) ? read(join(dir, 'blog/feed.xml')) : '';
  const llms = existsSync(join(dir, 'llms.txt')) ? read(join(dir, 'llms.txt')) : '';
  for (const r of posts) {
    const slug = r.slice('blog/'.length);
    const url = base + r;
    if (!blogIndex.includes(`href="${slug}"`)) err(r, 'not linked from blog/index.html');
    if (!feed.includes(`<link>${url}</link>`)) err(r, 'missing from blog/feed.xml');
    if (!llms.includes(url)) err(r, 'missing from llms.txt');
  }
}

for (const w of warnings) console.log(`warn  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s) in ${dir}`);
process.exit(errors.length ? 1 : 0);
