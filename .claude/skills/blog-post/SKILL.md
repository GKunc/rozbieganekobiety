---
name: blog-post
description: Create or update a static blog post for this landing (outline, draft, SEO and AI-search tags, index, feed, sitemap and llms.txt updates). Use when asked to write, add or refresh an article.
---

# blog-post

1. Read `brief/landing.md` (domain-knowledge skill). Pick or confirm one target keyword, the search intent and the question the post answers.
2. Propose title, slug (lowercase-hyphenated) and a 5-8 heading outline, headings phrased the way people ask; get a quick OK if the user is present, otherwise proceed.
3. Copy `src/blog/_template.html` to `src/blog/<slug>.html` and fill every placeholder:
   - POST_TITLE, POST_DESCRIPTION (120-155 chars), SLUG, DATE and DATE_MODIFIED (YYYY-MM-DD, same on first publish).
   - AUTHOR_NAME / AUTHOR_URL from the brief. If there is no named author, change the JSON-LD `author` to `{ "@id": "SITE_URL/#organization" }`, set the byline and `<meta name="author">` to the brand.
   - POST_IMAGE: absolute URL of a post image if you add one (1200x630), else `SITE_URL/og.png`.
   - CTA_HEADING / CTA_TEXT: one line linking the post topic to the offer.
   - Shared values (BRAND, LANG, LOCALE, THEME_COLOR, SITE_URL, CTA_LABEL) as on the home page.
4. Write POST_BODY in the brand voice: first paragraph answers the question directly; then specifics, examples, steps, a short summary. h2/h3 only (the title is the h1). No invented stats; cite sources. Link to the landing CTA and 1-3 related posts. Images: `alt`, width, height, `loading="lazy"`.
5. Wire it up (`tools/check.mjs` fails if any is missing):
   - `src/blog/index.html`: `<li>` at the top of `#post-list` with link, `<time>` and a one-sentence summary.
   - `src/blog/feed.xml`: `<item>` at the top (title, link, guid, RFC 822 pubDate, description).
   - `src/sitemap.xml`: `<url><loc>SITE_URL/blog/<slug>.html</loc></url>` (lastmod is added at deploy).
   - `src/llms.txt`: `- [Title](URL): one-line summary` under `## Blog`.
   - Add a link from 1-2 older related posts to the new one.
6. Updating an existing post: change the content, set DATE_MODIFIED in the JSON-LD, the `article:modified_time` meta and the visible "Updated" date. Only for real changes.
7. Run `node tools/check.mjs` and the `seo` checklist on the post.
