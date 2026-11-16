# Landing page template

Static landing page: plain HTML, CSS, JS. No build step for the site itself; CI copies `src/` to `_site/` (adds sitemap lastmod) and deploys it to GitHub Pages.
One repo per landing page. Start with the `new-landing` skill; hosting is handled by the `publish` skill. A new computer, or tooling that misbehaves → `dev-setup` skill (`node tools/doctor.mjs`).

## Rules
- All page source lives in `src/`. Keep it dependency-free. Repo tooling lives in `tools/` (Node, no npm deps).
- Placeholders look like `{{NAME}}`; the values live in `brief/landing.md`. No `{{` may remain at release (except `src/blog/_template.html`).
- Read `brief/landing.md` (via the `domain-knowledge` skill) before writing any copy. Never invent facts, numbers, testimonials or legal details. Remove a section rather than ship filler.
- Mobile-first, semantic HTML, one `<h1>`, accessible forms, no layout shift, works without JS.
- Relative links inside the site (it may live under `/<repo>/`), except `404.html`, which uses absolute `SITE_URL` links.
- Every new page goes into `sitemap.xml` and `llms.txt`; every post also into `blog/index.html` and `blog/feed.xml`.
- The person using this is not technical: never ask them to open GitHub settings. Do hosting work with `gh`.

## Before calling anything done
1. `node tools/verify.mjs` passes (release checks, build, HTML validation, internal links; `--lighthouse` for the full CI set).
2. Preview (`.claude/launch.json` → `site`) checked with Chrome DevTools MCP: console clean, 375px and desktop, light and dark.
3. After pushing: `gh run watch` succeeds (CI also runs html-validate, lychee and Lighthouse) and the live URL returns 200.

## Skills (`.claude/skills/`)
dev-setup, new-landing, publish, domain-knowledge, seo, blog-post, audit, webmcp
