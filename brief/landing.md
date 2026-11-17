# Landing brief

Business facts for this page. Claude reads it before writing anything and never invents what is missing.
Source: the current site https://rozbieganekobiety.pl/ (WordPress), home page copied on 2026-11-17.

Short, reusable values (brand, colours, URL, title, headline, CTA, form endpoint, author, verification codes)
live in `site.config.json`, not here: the build puts them into every page. This file holds everything else.

## Identity
- LOGO: (the current site has a raster logo at wp-content/uploads/2024/12/logo-scaled.png; not copied yet)
- Tagline: "W kobietach siła"; motto: "Od kobiet dla kobiet"
- Social profiles (become schema.org `sameAs`):
  - https://www.facebook.com/obozy.dla.kobiet
  - https://www.instagram.com/obozysportowe.dlakobiet/

## Hosting
- REPO_NAME: rozbieganekobiety
- REPO_OWNER: GKunc
- CUSTOM_DOMAIN: rozbieganekobiety.pl (GitHub Pages; DNS at OVH: A/AAAA to GitHub Pages, www CNAME to gkunc.github.io; email MX at OVH stays untouched)

## Business
- What is offered:
  - Open, free running trainings in Kraków (stationary).
  - Training group (paid package, joined via WhatsApp; separate rules: "Regulamin grupy zamkniętej").
  - Individual training cooperation 1:1: interview and tests, training plan (running and/or strength), running technique.
  - Running camps for women (trainings, stretching classes, motivational workshops, evening get-togethers; activities for women who cannot run).
- Target audience: women at every level, from beginners to marathon runners, in Kraków.
- Main problem solved: starting or continuing to run in a safe, supportive environment with qualified (women) coaches.
- Unique selling points: from women for women; trainings adjusted to the level; community and relationships; relaxation and development.
- How to join: 1) read the offer, 2) fill in the form, 3) reply from us, 4) pay for the package, 5) join WhatsApp.
- Price / offer (from /oferta/, updated 2026-07-14):
  - Group "Rozbiegane": every Monday 19:00, Błonia / Park Jordana, max 10 people. 80 zł (1×/week + contact with group and coaches + running tips); 300 zł incl. individual training plan. Sign-up: Google Form (link in src/oferta/index.html).
  - Individual: consultation 250 zł (interview, video analysis, technique, warm-up, fitness elements); 4 trainings 600 zł; 8 trainings 1100 zł.
  - Training plans (only after an individual package): monthly 250 zł; +1 run meeting 350 zł; +4 meetings 800 zł. Includes constant contact with the coach.
  - Open trainings: free, announced in posts (Aktualności).
- Location / service area: Kraków (no street address given).

## Proof (real only)
- Testimonials (from the current site, no names; all about the camp):
  - "Dzięki obozowi nie tylko poprawiłam formę, ale też poznałam niesamowite osoby. Czułam wsparcie na każdym kroku!"
  - "To były najlepsze dni w roku! Fantastyczna atmosfera, świetne treningi i ogromna dawka motywacji. Polecam każdej kobiecie!"
  - "Profesjonalne podejście, malownicze trasy i czas tylko dla mnie. Wyjechałam pełna energii i inspiracji do dalszego biegania!"
- Numbers / results: none given.

## FAQ (from the current site)
- Q: Dla kogo przeznaczony jest obóz?
  A: Obóz jest skierowany do kobiet na każdym poziomie zaawansowania – zarówno dla początkujących, jak i doświadczonych biegaczek. Treningi są dostosowane do Twoich możliwości i celów. W trakcie wyjazdu organizujemy treningi dla dziewczyn biegających oraz równolegle aktywności dla dziewczyn, które nie mogą biegać.
- Q: Czy dołączenie do grupy biegowej wymaga jakiegoś poziomu zaawansowania?
  A: Nie. Nasza grupa jest dla kobiet na różnych etapach przygody z bieganiem. Dostosowuję tempo i ćwiczenia tak, żebyś czuła się komfortowo. Ważne jest to, że chcesz się ruszać – resztą zajmiemy się razem.
- Q: Co zabrać na pierwszy trening?
  A: Wygodne buty do biegania, ubranie dostosowane do pogody i… uśmiech. Jeśli masz zegarek sportowy – super, ale absolutnie nie jest konieczny.
- Q: Jak wyglądają treningi indywidualne?
  A: Pracujemy 1:1. Zaczynam od krótkiego wywiadu i testów, żeby poznać Twoje cele i możliwości. Na tej podstawie układam plan treningowy (biegowy i/lub motoryczny), który realizujemy razem oraz samodzielnie między spotkaniami.
- Q: Jak zapisać się na zajęcia?
  A: Najprościej – napisz do mnie wiadomość lub wypełnij formularz na stronie. Odezwę się, ustalimy termin i działamy.

## Contact
- Phone: +48 570 080 490
- Email: magda.kunc@rozbieganekobiety.pl (Magda Kunc, coach)

## Author (for blog posts and E-E-A-T; name and URL go into site.config.json)
- AUTHOR_BIO: Magdalena Kunc – instruktorka PZLA, trenerka personalna, instruktorka fitnessu PROFI Fitness School; była zawodniczka (800 m), dziś startuje na 10 km i w półmaratonie; członkini AZS AKF Kraków Masters.

## Voice
- Tone: warm, encouraging, informal "Ty" (feminine forms), energetic.
- Words to use / avoid: "od kobiet dla kobiet", "społeczność", "wsparcie".

## SEO
- Primary keyword: grupa biegowa dla kobiet Kraków
- Secondary keywords: treningi biegowe dla kobiet, bieganie dla początkujących Kraków, obóz biegowy dla kobiet, trener biegania Kraków
- Competitors / reference sites:

## Forms, analytics, compliance
- Contact form: sign-ups through two Google Forms (group, individual) on /kontakt/; own contact form appears there once FORM_ENDPOINT is set (form worker).
- Who receives enquiries: magda.kunc@rozbieganekobiety.pl
- Analytics wanted: none for now
- AI_CRAWLERS: allow-all

## Facts Claude must not invent
- Legal entity: Smoksport Magdalena Kunc, NIP 6793255607 (from the RODO clause PDF).
- Prices, dates and places of camps and trainings.

## site.config.json cheat sheet
| Key | What to put |
| --- | --- |
| BRAND, BRAND_INITIAL | name; one letter for the generated favicon |
| THEME_COLOR | brand accent as 6-digit #hex |
| LANG, LOCALE | e.g. `pl` and `pl_PL` |
| LEGAL_ENTITY, CONTACT_EMAIL | who is responsible for the site (privacy policy) |
| SITE_URL | (auto, publish skill) https URL without trailing slash |
| INDEXNOW_KEY | (auto) `openssl rand -hex 16` |
| PAGE_TITLE | 30-60 chars incl. brand, primary keyword first |
| H1_HEADLINE, SUBHEADLINE, CTA_LABEL | hero copy and button label |
| META_DESCRIPTION | 120-155 chars, with a reason to click |
| LLMS_SUMMARY | 2-4 plain sentences: what the business is, for whom, where |
| BLOG_TITLE, BLOG_DESCRIPTION | needed from the first post on |
| AUTHOR_NAME, AUTHOR_URL | blog author (LinkedIn or about page) |
| FORM_ENDPOINT | (auto with the form worker: `node tools/form-worker.mjs deploy`) or the external form service URL |
| FORM_PROVIDER | who processes the form, for the privacy policy ("Cloudflare and Resend" with the worker) |
| EMAIL_FROM | sender of the autoreply; domain verified in Resend |
| FORM_NOTIFY_TO | who gets enquiries (empty = CONTACT_EMAIL) |
| TURNSTILE_SITE_KEY | Cloudflare Turnstile site key (anti-bot check, needed for the autoreply) |
| FORM_ACCESS_KEY | only for services that need a key in the form (e.g. Web3Forms) |
| ANALYTICS, ANALYTICS_ID | `none`, `plausible` (id = domain, may stay empty), `goatcounter` (site code), `cloudflare` (token), `ga4` (G-…) |
| PRIVACY_UPDATED | YYYY-MM-DD |
| GOOGLE_SITE_VERIFICATION, BING_SITE_VERIFICATION | filled after launch (`node tools/google.mjs verification-token`) |
