#!/usr/bin/env node
// Generates og.png (1200x630), apple-touch-icon.png (180), icon-192.png, icon-512.png
// from src/favicon.svg, the brand name, the <h1> and theme-color in src/index.html.
// Needs a local Chrome/Chromium (set CHROME=/path/to/chrome to override).
// Usage: node tools/make-assets.mjs [siteDir=src]
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, SRC, read } from './lib.mjs';

const dir = resolve(process.argv[2] || SRC);
const html = read(join(dir, 'index.html'));
const decode = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
const brand = decode(html.match(/<a class="brand"[^>]*>([\s\S]*?)<\/a>/)?.[1] || '');
const headline = decode(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] || '');
const color = html.match(/<meta name="theme-color" content="(#[0-9a-fA-F]{3,8})"/)?.[1];
if (!brand || !headline || !color || /\{\{/.test(brand + headline)) {
  console.error('Fill BRAND, H1_HEADLINE and THEME_COLOR in src/index.html first.');
  process.exit(1);
}

const candidates = [
  process.env.CHROME,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].filter(Boolean);
const chrome = candidates.find((c) => existsSync(c));
if (!chrome) { console.error('Chrome not found; set CHROME=/path/to/chrome'); process.exit(1); }

const page = pathToFileURL(join(ROOT, 'tools/assets.html')).href;
const svg = pathToFileURL(join(dir, 'favicon.svg')).href;
const shots = [
  { file: 'og.png', w: 1200, h: 630, q: { type: 'og', brand, headline, color, svg } },
  { file: 'apple-touch-icon.png', w: 180, h: 180, q: { type: 'icon', size: 180, color, svg } },
  { file: 'icon-192.png', w: 192, h: 192, q: { type: 'icon', size: 192, color, svg } },
  { file: 'icon-512.png', w: 512, h: 512, q: { type: 'icon', size: 512, color, svg } },
];
for (const s of shots) {
  const out = join(dir, s.file);
  execFileSync(chrome, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--allow-file-access-from-files', '--virtual-time-budget=2000',
    `--window-size=${s.w},${s.h}`, `--screenshot=${out}`,
    `${page}?${new URLSearchParams(s.q)}`,
  ], { stdio: 'ignore' });
  console.log(`wrote ${out}`);
}
