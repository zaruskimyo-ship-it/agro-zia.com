# Agro-Zia Multilingual Architecture

## Status

Design baseline for the multilingual phase. Production remains on the stable V3 baseline until the multilingual implementation is reviewed and promoted.

## Languages

- `en` — English — master content / LTR
- `ru` — Russian — LTR
- `fa` — Persian — RTL
- `ar` — Arabic — RTL
- `uz` — Uzbek — LTR
- `tr` — Turkish — LTR

## URL strategy

Language-prefixed paths are the canonical public structure:

- `/en/`
- `/ru/`
- `/fa/`
- `/ar/`
- `/uz/`
- `/tr/`

Core sections will have language-equivalent routes for Products, Engineering, Projects, Trade, Markets, Knowledge, About, and Contact.

## Directionality

The document direction must be determined by the active locale. Persian and Arabic use true RTL layout; English, Russian, Uzbek, and Turkish use LTR. Direction must affect layout, navigation, forms, spacing, icons, and alignment—not just text flow.

## SEO requirements

Every localized page should provide:

- locale-specific `<title>` and meta description
- canonical URL
- `hreflang` alternates for all available language versions
- `x-default` where appropriate
- Open Graph locale metadata
- language-aware sitemap entries
- structured data consistent with the localized page

## Content policy

English is the initial content reference. Published translations should be reviewed rather than generated blindly at request time. Technical, commercial, product, certification, and market terminology must remain consistent across languages.

## Implementation principles

1. Do not modify Production directly.
2. Build multilingual work on a dedicated feature branch.
3. Keep the current V3 homepage visually stable unless a multilingual requirement requires a change.
4. Prefer maintainable static assets and deterministic rendering over runtime translation services.
5. Validate Desktop, Mobile, RTL/LTR, navigation, forms, and SEO before promotion.
6. Promote to `main` only after Preview QA is explicitly approved.

## Proposed route map

| Section | English | Russian | Persian | Arabic | Uzbek | Turkish |
|---|---|---|---|---|---|---|
| Home | `/en/` | `/ru/` | `/fa/` | `/ar/` | `/uz/` | `/tr/` |
| Products | `/en/products` | `/ru/products` | `/fa/products` | `/ar/products` | `/uz/products` | `/tr/products` |
| Engineering | `/en/engineering` | `/ru/engineering` | `/fa/engineering` | `/ar/engineering` | `/uz/engineering` | `/tr/engineering` |
| Projects | `/en/projects` | `/ru/projects` | `/fa/projects` | `/ar/projects` | `/uz/projects` | `/tr/projects` |
| Trade | `/en/trade` | `/ru/trade` | `/fa/trade` | `/ar/trade` | `/uz/trade` | `/tr/trade` |
| Markets | `/en/markets` | `/ru/markets` | `/fa/markets` | `/ar/markets` | `/uz/markets` | `/tr/markets` |
| Knowledge | `/en/knowledge` | `/ru/knowledge` | `/fa/knowledge` | `/ar/knowledge` | `/uz/knowledge` | `/tr/knowledge` |
| About | `/en/about` | `/ru/about` | `/fa/about` | `/ar/about` | `/uz/about` | `/tr/about` |
| Contact | `/en/contact` | `/ru/contact` | `/fa/contact` | `/ar/contact` | `/uz/contact` | `/tr/contact` |
