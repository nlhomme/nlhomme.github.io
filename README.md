# blog.lhomme.xyz

Source of [blog.lhomme.xyz](https://blog.lhomme.xyz), the personal blog of Nicolas LHOMME. Built with [Eleventy](https://www.11ty.dev), deployed on Cloudflare Pages.

The design goal: HTML + Markdown, one inline stylesheet, the smallest possible amount of JavaScript (only a theme toggle).

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

The URL is derived from the filename: `2026-04-12-mon-article.md` → `/posts/mon-article/`.

## Deploy

Cloudflare Pages is connected to this repo. Build settings:

- Build command: `npm run build`
- Output directory: `_site`
- Node version: 20+

Every push to `main` triggers a build and deploy.

## License

[MIT](LICENSE).
