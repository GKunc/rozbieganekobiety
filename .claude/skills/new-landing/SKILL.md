---
name: new-landing
description: Turn this template into a finished, published landing page from brief/landing.md. Use when starting a new page or when the user says "set up the landing".
---

# new-landing

The person using this does not need to know about GitHub Pages, Actions or DNS. Ask only for business facts; handle hosting yourself via the `publish` skill.

0. **Machine.** Run `node tools/doctor.mjs --fix`. Any ✘ → run the `dev-setup` skill first.
1. **Brief.** Read `brief/landing.md` (domain-knowledge skill). Required: BRAND, THEME_COLOR, LANG, LOCALE, LEGAL_ENTITY, CONTACT_EMAIL, PAGE_TITLE, H1_HEADLINE, META_DESCRIPTION, CTA_LABEL, FORM_ENDPOINT, primary keyword, REPO_NAME. Ask for missing ones in one message; never guess.
2. **Repo and URL first.** Run `publish` steps 1-3 so the repo exists, Pages is enabled and the real SITE_URL is known (no trailing slash). Write SITE_URL and a fresh `INDEXNOW_KEY` (`openssl rand -hex 16`) into the brief.
3. **Fill placeholders** in every file under `src/` except `blog/_template.html` (its placeholders are per post). Derived values:
   - BRAND_INITIAL from the brand; PRIVACY_UPDATED = today (YYYY-MM-DD).
   - ANALYTICS_STATEMENT: one honest sentence matching the ANALYTICS choice (e.g. "We use Plausible, a cookie-free analytics tool that collects no personal data.").
4. **Copy.** Rewrite benefits, proof and FAQ from the brief (domain-knowledge skill).
   - No real testimonial → delete the whole `#proof` section and its nav link. No FAQ → delete `#faq`, its nav link and the FAQPage JSON-LD block. Never ship filler; `tools/check.mjs` fails on it.
   - FAQ: each `<summary>` must equal a Question `name` in the FAQPage JSON-LD, answers identical.
   - Answer-first copy: the first paragraph under the H1 should say plainly what BRAND is, for whom and where (AI assistants quote this).
   - If LANG is not `en`, translate UI strings too: nav, skip link, form labels, `data-msg-*`, consent note, footer, 404 and privacy pages.
5. **Schema.** Fill `sameAs` with social profile URLs. Add a `Service`, `Product` or `LocalBusiness` node to the `@graph` when the brief supports it (address/area only from the brief).
6. **Brand.** Set `--accent` / `--accent-text` in `src/css/styles.css` (and the dark-mode pair; both must keep 4.5:1 contrast). Replace `favicon.svg` with the logo mark if LOGO is given. Then run `node tools/make-assets.mjs` to create `og.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, and look at `og.png`.
7. **Analytics.** Insert the snippet for the chosen tool at the `<!-- analytics -->` markers (all pages). Prefer cookie-free tools. `ga4` also needs a consent banner with Google Consent Mode v2 defaulting to denied; tell the user.
8. **AI crawlers.** If AI_CRAWLERS is `search-only`, change the training-bot group in `src/robots.txt` to `Disallow: /`. Never block OAI-SearchBot, ChatGPT-User, PerplexityBot or Claude-SearchBot.
9. **llms.txt.** Make it a faithful plain-language summary: LLMS_SUMMARY, key offer facts, links.
10. **Verify.** `node tools/verify.mjs` must pass (release checks, build, HTML validation, internal links). Start the `site` preview (`.claude/launch.json`) and check with Chrome DevTools MCP: no console errors, layout at 375px and 1280px, light and dark mode, keyboard focus visible, form submits to the endpoint. Run the `seo` skill.
11. **Publish.** Run `publish` steps 4+ (commit, push, watch the deploy, confirm the live URL). Give the user the live URL and the open items (e.g. Search Console codes).
