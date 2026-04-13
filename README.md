# blog.lhomme.xyz

Source of [blog.lhomme.xyz](https://blog.lhomme.xyz), the personal blog of Nicolas LHOMME. Built with [Eleventy](https://www.11ty.dev), deployed on Cloudflare Pages.

The design mimics the Chirpy Jekyll theme the blog ran on previously: dark palette, fixed left sidebar with avatar + nav + social icons, card-based post list, and a right panel (on screens ≥1200px) with trending tags, recently published posts, and — on articles — a table of contents. Everything lives in a single inline stylesheet inside `src/_includes/base.njk`. The JavaScript is kept to a minimum: a mobile sidebar toggle and a small script that builds the per-post TOC from the article's headings. Source Sans 3 and Lato are loaded from Google Fonts.

## Develop

```bash
npm install
npm run dev      # live-reload server on http://localhost:8080
npm run build    # production build → _site/
```

## Layout

```
.eleventy.js            # Eleventy config
src/
  _data/site.json       # Site-wide settings
  _includes/
    base.njk            # HTML shell + inline CSS + theme toggle
    post.njk            # Post layout
  posts/                # Articles (Markdown + YAML front matter)
  index.njk             # Home page
  about.md              # /about/
  robots.txt
  assets/               # Images, favicons
```

New posts go in `src/posts/` as `YYYY-MM-DD-slug.md` with this front matter:

```yaml
---
title: Titre de l'article
date: 2026-04-12T14:00:00+02:00
categories: [Catégorie]
tags: [tag1, tag2]
---
```

The URL is derived from the filename verbatim (date prefix stripped, case preserved): `2026-04-12-Mon-Article.md` → `/posts/Mon-Article/`. Keep existing filename capitalization stable to avoid breaking inbound links.

## Deploy

Cloudflare Pages is connected to this repo. Build settings:

- Build command: `npm run build`
- Output directory: `_site`
- Node version: 20+

Every push to `main` triggers a build and deploy.

## License

[MIT](LICENSE).
