# Landing brief

Fill this in per page. Claude reads it before writing anything and never invents what is missing.
Fields marked (auto) are filled by Claude during `new-landing` / `publish`.

## Identity
- BRAND:
- BRAND_INITIAL: (letter for the generated favicon; skip if a logo is provided)
- LOGO: (path or URL to an SVG/PNG logo, optional)
- THEME_COLOR: (brand accent as #hex; also used for buttons and links)
- LANG: (e.g. en, pl)
- LOCALE: (e.g. en_US, pl_PL)
- LEGAL_ENTITY: (company or person responsible for the site, for the privacy policy)
- CONTACT_EMAIL:
- Social profiles (become schema.org `sameAs`):
  -

## Hosting
- REPO_NAME: (new GitHub repo name, e.g. acme-landing)
- REPO_OWNER: (GitHub user or organization)
- CUSTOM_DOMAIN: (optional, e.g. www.acme.com; leave empty to use github.io)
- SITE_URL: (auto) https://<owner>.github.io/<repo> or https://<custom domain>
- INDEXNOW_KEY: (auto)

## Page copy
- PAGE_TITLE: (30-60 chars incl. brand, primary keyword first)
- H1_HEADLINE:
- SUBHEADLINE:
- META_DESCRIPTION: (120-155 chars, with a reason to click)
- CTA_LABEL:
- LLMS_SUMMARY: (2-4 plain sentences: what the business is, for whom, where; used by AI assistants)
- BLOG_TITLE: (e.g. "Office plant care guides")
- BLOG_DESCRIPTION: (120-155 chars)

## Business
- What is offered:
- Target audience:
- Main problem solved:
- Unique selling points:
- Price / offer:
- Location / service area: (if local, Claude adds LocalBusiness schema)

## Proof (real only)
- Testimonials (quote, name, role, permission to publish):
  -
- Numbers / results (with source):
  -
- Client logos (with permission):
  -

## FAQ (real questions customers ask; becomes the FAQ section + FAQPage schema)
- Q:
  A:

## Author (for blog posts and E-E-A-T)
- AUTHOR_NAME:
- AUTHOR_URL: (LinkedIn or about page)
- AUTHOR_BIO: (one or two sentences on real expertise)

## Voice
- Tone:
- Words to use / avoid:

## SEO
- Primary keyword:
- Secondary keywords:
- Competitors / reference sites:

## Forms, analytics, compliance
- FORM_ENDPOINT: (Formspree / Getform / Basin URL)
- FORM_PROVIDER: (name of that service, for the privacy policy)
- ANALYTICS: none | plausible | goatcounter | cloudflare | ga4 (ga4 needs a consent banner)
- ANALYTICS_ID: (site id / token for the chosen tool)
- AI_CRAWLERS: allow-all | search-only (search-only blocks model-training bots, keeps AI search)

## Search engine verification (optional; the publish skill asks for these after launch)
- GOOGLE_SITE_VERIFICATION: (content value of the google-site-verification meta tag)
- BING_SITE_VERIFICATION: (msvalidate.01 value; or import the site from Google Search Console)

## Facts Claude must not invent
- (claims, numbers, testimonials, legal details)
