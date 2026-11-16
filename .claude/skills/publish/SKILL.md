---
name: publish
description: Create the GitHub repo, switch on hosting (GitHub Pages), set a custom domain, deploy and confirm the site is live, then hook up Google Search Console and Bing. Use when the user wants the page online, a new domain, or asks "is it live?".
---

# publish

Hosting is GitHub Pages deployed by `.github/workflows/pages.yml`. The user should never have to open GitHub settings: do everything with the `gh` CLI and only ask them for things that need their own accounts (GitHub sign-in, DNS, Google/Bing).

## 0. Prerequisites
- `gh auth status` must succeed. If `gh` is missing: `brew install gh`. If not signed in, ask the user to run `gh auth login` themselves (it is their sign-in; never handle their token).
- Read REPO_OWNER, REPO_NAME, CUSTOM_DOMAIN from `brief/landing.md`.

## 1. Repo
- Check where you are: `gh repo view --json nameWithOwner,isTemplate,visibility`.
- If this is the template repo itself (`isTemplate: true`), do not publish it. Create the page repo from it, then continue in the new clone:
  `gh repo create OWNER/NAME --template <template owner>/<template name> --public --clone` (run it from the parent folder).
- If there is no remote yet: `gh repo create OWNER/NAME --public --source . --push`.
- Public is the default: GitHub Pages on a private repo requires a paid GitHub plan, and the site itself is public anyway. Only use `--private` if the user confirms they have GitHub Pro/Team/Enterprise.

## 2. Turn on Pages (deploys from the workflow)
```
gh api -X POST repos/OWNER/NAME/pages -f build_type=workflow \
  || gh api -X PUT repos/OWNER/NAME/pages -f build_type=workflow
```

## 3. URL (and optional custom domain)
- No custom domain: `gh api repos/OWNER/NAME/pages --jq .html_url` → SITE_URL (drop the trailing `/`).
- Custom domain: `gh api -X PUT repos/OWNER/NAME/pages -f cname=DOMAIN`. Tell the user exactly which DNS records to add at their registrar:
  - subdomain (`www.example.com`): `CNAME www -> OWNER.github.io`
  - apex (`example.com`): `A` 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 and `AAAA` 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153
  - Recommend they also verify the domain in their GitHub account settings (protects against takeover).
  - Once DNS resolves and the certificate is issued (`gh api repos/OWNER/NAME/pages --jq .https_certificate.state` is `approved`): `gh api -X PUT repos/OWNER/NAME/pages -F https_enforced=true`.
  - SITE_URL = `https://DOMAIN`. If SITE_URL changes later, replace it everywhere in `src/` (canonicals, sitemap, robots, llms, JSON-LD, 404).
- Save SITE_URL in the brief.

## 4. Deploy
1. `node tools/verify.mjs` must pass (the pre-push hook runs `--quick` too).
2. Commit and push to `main`. The workflow runs release checks, HTML validation, link check and Lighthouse; only then does it deploy.
3. Wait for it: `gh run watch --exit-status $(gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId')` (run in the background; takes a few minutes).
4. On failure: `gh run view --log-failed`, fix, push again. The Lighthouse report is attached to the run as the `lighthouse` artifact.

## 5. Confirm live
- `curl -sI SITE_URL/` returns 200; also check `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/indexnow.txt`, `/og.png`.
- The workflow's `after-deploy` job already pinged IndexNow (Bing, Yandex, Seznam, Naver; Bing feeds ChatGPT search and Copilot).

## 6. Search engines (needs the user's accounts; ask once, after the first deploy)
- **Google Search Console**: ask the user to add a *URL-prefix* property for `SITE_URL/`, choose the *HTML tag* method and paste you the `content` value. Add `<meta name="google-site-verification" content="...">` at the `site-verification` comment in `src/index.html`, push, wait for the deploy, then they click Verify and submit `sitemap.xml`.
- **Bing Webmaster Tools**: easiest is "Import from Google Search Console". Otherwise add `<meta name="msvalidate.01" content="...">` the same way.
- Store both values in the brief so they survive edits.

## 7. Report
Tell the user: the live URL, what was checked, and anything waiting on them (DNS, verification). No GitHub jargon unless they ask.
