# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal blog of Nicolas LHOMME (https://blog.lhomme.xyz), built with [Eleventy](https://www.11ty.dev) (11ty 3.x). Content is in French. Deployed to Cloudflare Pages.

The design is deliberately minimal: a single inline-CSS layout, no client-side framework, one small vanilla-JS snippet for the light/dark toggle.

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
.eleventy.js            # Eleventy config (CommonJS)
package.json            # npm scripts and single dep: @11ty/eleventy
src/
  _data/site.json       # Site-wide settings (title, tagline, url, etc.)
  _includes/
    base.njk            # Root HTML shell with inline CSS + theme toggle JS
    post.njk            # Post layout (extends base.njk)
  posts/
    posts.json          # Directory data: layout + permalink template
    YYYY-MM-DD-slug.md  # Posts (Markdown + front matter)
  index.njk             # Home page — post list
  about.md              # /about/
  robots.txt            # Passthrough
  assets/               # Passthrough → /assets/ (images, favicons)
_site/                  # Build output (gitignored)
```

## Post URLs

Posts live at `/posts/<slug>/`, where `<slug>` is derived from the filename (date stripped, lowercased via Eleventy's `slug` filter). This mirrors the previous Jekyll/Chirpy permalinks so inbound links keep working.

Post front matter looks like:

```yaml
---
title: Titre de l'article
date: 2026-04-12 14:00:00 +0200
categories: [Projets, TRMNL]
tags: [trmnl, cloudflare]
---
```

Images in posts use absolute paths like `/assets/img/posts/<post-folder>/<file>` — there is no `media_subpath` shortcut.

## Deploy (Cloudflare Pages)

Cloudflare Pages is configured via the dashboard (no workflow file):

- Framework preset: none
- Build command: `npm run build`
- Build output directory: `_site`
- Node version: 20 (or newer)

Any push to `main` triggers a build and deploy automatically.
