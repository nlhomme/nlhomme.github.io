# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal blog of Nicolas LHOMME (https://blog.lhomme.xyz), built with [Eleventy](https://www.11ty.dev) (11ty 3.x). Content is in French. Deployed to Cloudflare Pages.

The design mimics the [Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) Jekyll theme the blog used previously: dark-only palette, fixed left sidebar with avatar + nav + socials, card-based post list, right panel (≥1200px) with trending tags + recently published + per-post table of contents, Source Sans 3 / Lato fonts (loaded from Google Fonts). The whole layout lives as inline CSS inside `src/_includes/base.njk`. Client-side JS is kept small: a mobile sidebar toggle, and a TOC generator that scans `article .content` headings on post pages, builds a linked outline in `#panel-wrapper`, and scroll-spies the active section.

## Keep README.md in sync — always

`README.md` is the documentation for this project. Before committing or pushing any change, verify that `README.md` still accurately describes the repo and update it in the same commit if anything it covers has shifted: commands, directory layout, front-matter format, deploy settings, dependencies, or anything else a new reader would need. If a change touches project conventions, the README update is part of the task — not a follow-up. When in doubt, read `README.md` end-to-end before you commit.

## Common commands

```bash
npm install          # install Eleventy (first time)
npm run dev          # local server with live reload on http://localhost:8080
npm run build        # production build → _site/
npm run clean        # delete _site/
```

## Layout

```
.eleventy.js            # Eleventy config (CommonJS) — posts / tagList / categoryList / archiveYears collections + date filters
package.json            # npm scripts and single dep: @11ty/eleventy
src/
  _data/site.json       # Site-wide settings (title, tagline, url, etc.)
  _includes/
    base.njk            # Root HTML shell: inline CSS, left sidebar, right #panel-wrapper, sidebar-toggle + TOC JS
    post.njk            # Post layout (extends base.njk)
  posts/
    posts.json          # Directory data: layout + permalink template
    YYYY-MM-DD-slug.md  # Posts (Markdown + front matter)
  index.njk             # Home page — post list
  archives.njk          # /archives/ — timeline grouped by year
  categories.njk        # /categories/ — grouped list of posts by category
  tags.njk              # /tags/ — tag cloud
  about.md              # /about/
  robots.txt            # Passthrough
  assets/               # Passthrough → /assets/ (images, favicons)
_site/                  # Build output (gitignored)
```

## Sidebar nav and listing pages

The left sidebar has five entries — Accueil, Catégories, Tags, Archives, À propos. The three listing pages are driven by collections defined in `.eleventy.js`:

- `collections.categoryList` — `[{ name, count, posts[] }]` sorted alphabetically, used by `src/categories.njk`.
- `collections.tagList` — `[{ name, count }]` sorted by count desc, used by `src/tags.njk` (tag cloud) and the right panel *Tags populaires*.
- `collections.archiveYears` — `[{ year, posts[] }]` sorted newest first, used by `src/archives.njk` to render the year-grouped timeline.

There are no per-tag or per-category archive pages yet. Tag pills on `/tags/` and in the right panel are visual-only; if we want `/tags/<slug>/` pages later, add an Eleventy pagination template over `collections.tagList`.

## Right panel (`#panel-wrapper`)

Rendered inline in `base.njk` next to `main`, visible only at ≥1200px (hidden below via CSS). Contents:

- **Tags populaires** — driven by the `tagList` collection in `.eleventy.js` (aggregates `post.data.tags`, drops the `posts` tag, sorts by count). Rendered as non-clickable pills; there are no tag archive pages yet.
- **Récemment publié** — first 5 entries of `collections.posts`.
- **Contenu** (post pages only) — injected client-side by a small script at the bottom of `base.njk`. It runs only when `article .post-header` exists, scans `h2`/`h3` inside `article .content`, assigns ids to headings that lack them, and builds `.toc-list`. A scroll listener toggles `.active` on the current section.

The TOC box is prepended to `#panel-wrapper` so it sits above tags and recent posts on post pages.

## Post URLs

Posts live at `/posts/<slug>/`, where `<slug>` is taken **verbatim** from the filename (date prefix stripped, case preserved). This mirrors the previous Jekyll/Chirpy permalinks exactly — including capital letters — so inbound links like `/posts/Bujur-le-monde/` keep working. Do not lowercase filenames on existing posts.

Post front matter looks like:

```yaml
---
title: Titre de l'article
date: 2026-04-12T14:00:00+02:00
categories: [Projets, TRMNL]
tags: [trmnl, cloudflare]
---
```

The `date` must be an ISO-8601 string — plain Jekyll-style `YYYY-MM-DD HH:MM:SS +0200` is rejected by Eleventy's YAML parser.

Images in posts use absolute paths like `/assets/img/posts/<post-folder>/<file>` — there is no `media_subpath` shortcut.

## Deploy (Cloudflare Pages)

Cloudflare Pages is configured via the dashboard (no workflow file):

- Framework preset: none
- Build command: `npm run build`
- Build output directory: `_site`
- Node version: pinned by `.nvmrc` at the repo root (currently `20`). Cloudflare Pages reads it automatically, so no `NODE_VERSION` env var is needed.

Any push to `main` triggers a build and deploy automatically.
