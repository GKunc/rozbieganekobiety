---
name: audit
description: Periodic health check of a live landing (deploy status, Lighthouse, links, freshness, search and AI visibility). Use monthly, before a campaign, or when the user asks "is the site OK?" or "why don't we rank?".
---

# audit

Report a short prioritized list (what is wrong, impact, fix), then fix what you can and ask about the rest.

1. **Deploys**: `gh run list --limit 10`. Any failed run on `main` means the live site is older than the repo; open it with `gh run view --log-failed`.
2. **Dependency updates**: merge open Dependabot PRs for GitHub Actions once their checks pass (`gh pr list --author app/dependabot`).
3. **Release checks**: `node tools/check.mjs`; fix errors, consider warnings.
4. **Live site**: `curl -sI` SITE_URL, `/sitemap.xml`, `/robots.txt`, `/llms.txt`. Run Lighthouse against the live URL with Chrome DevTools MCP (mobile); flag anything under 90, plus LCP > 2.5 s, CLS > 0.1 and INP problems.
5. **External links**: check outbound links in pages and posts still work (Chrome DevTools MCP or `curl -sI`); replace or remove dead ones.
6. **Freshness**: posts whose facts may have changed or whose `dateModified` is over 12 months old: refresh content, update `dateModified`, the visible "Updated" date and the feed. Never bump dates without real changes.
7. **Brief vs. page**: prices, offer, testimonials and FAQ on the page must still match `brief/landing.md`; ask the user if anything looks outdated.
8. **AI visibility**: `llms.txt` lists every post and the summary is still accurate; robots.txt still allows the AI search crawlers; the first paragraph still says plainly what the business is.
9. **Search Console / Bing** (ask the user for screenshots or numbers if you have no access): indexing errors, pages "Crawled - currently not indexed", top queries to target with new posts.
10. **WebMCP**: the API is experimental; check current Chrome docs and update `src/js/webmcp.js` if it was renamed.
