# Landing page template

Static landing pages (plain HTML, CSS, JS) built and maintained with Claude Code, optimized for Google and AI assistants (ChatGPT, Perplexity, Claude, AI Overviews), hosted on GitHub Pages. One repo per page.

## Make a new page
1. Fill in `brief/landing.md` (business facts, copy, FAQ, repo name).
2. Open this repo in Claude Code and say: **"set up the landing"**.

Claude creates the page repo from this template, switches on hosting, fills the page, generates the social image and icons, runs every check, deploys, and gives you the live URL. You only provide business facts and, when asked, sign in to GitHub (`gh auth login`), add DNS records for a custom domain, or paste Search Console codes.

## Day to day
- new computer / "the preview doesn't work" → `dev-setup` skill (installs tools, git hooks, live-reload preview)
- "write a blog post about …" → `blog-post` skill
- "check SEO" / "why don't we show up in ChatGPT?" → `seo` skill
- "is the site OK?" (monthly) → `audit` skill
- "put it on example.com" → `publish` skill

## What's inside
| Path | Purpose |
| --- | --- |
| `src/` | The site: home, blog, privacy, 404, robots.txt, sitemap.xml, llms.txt, RSS feed, manifest, icons |
| `brief/landing.md` | Per-page facts; Claude never invents beyond it |
| `tools/serve.mjs` | Local preview of `src/` with live reload (the `site` preview) |
| `tools/verify.mjs` | Runs the CI checks locally (`--quick` offline, `--lighthouse` full) |
| `tools/doctor.mjs` | Checks this computer is ready to develop; `--fix` sets up hooks and the preview |
| `.githooks/` | pre-commit: release checks; pre-push: `verify.mjs --quick` |
| `tools/check.mjs` | Release checks (placeholders, filler copy, meta, JSON-LD, FAQ schema, sitemap, blog wiring) |
| `tools/build.mjs` | Builds `_site/` for deploy and adds sitemap `<lastmod>` from git history |
| `tools/make-assets.mjs` | Generates `og.png` and app icons from the brand (needs local Chrome) |
| `tools/indexnow.mjs` | Notifies Bing/IndexNow of changed URLs after each deploy |
| `.github/workflows/pages.yml` | On PRs: checks. On `main`: checks → HTML validation → link check → Lighthouse → deploy → smoke test → IndexNow |
| `.github/dependabot.yml` | Keeps the workflow's actions up to date |
| `lighthouserc.json` | Lighthouse budgets: performance ≥ 0.9; accessibility, best practices, SEO ≥ 0.95; CLS ≤ 0.1 |
| `.claude/skills/` | dev-setup, new-landing, publish, domain-knowledge, seo, blog-post, audit, webmcp |
| `.claude/launch.json` | Local preview server (`node tools/serve.mjs 4321`, live reload) |
| `.mcp.json` | Chrome DevTools MCP for checking pages while developing |

Requirements on the machine running Claude Code: Node 22+, git, Chrome and the GitHub CLI. Say "set up my environment" and the `dev-setup` skill installs and checks them.

## Maintaining this template
- Mark this repo as a template once: `gh repo edit --template`. CI and deploy are skipped in the template repo itself (it is all `{{placeholders}}`) and run in every repo created from it.
- To test template changes, fill a copy of `src/` and run `node tools/check.mjs <dir>` and `node tools/build.mjs <dir> <out>`.
