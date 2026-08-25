# Agro-Zia Multilingual Architecture

This directory is the translation layer for the Agro-Zia B2B site.

## Target languages

- `en` — English (source language)
- `ru` — Русский
- `fa` — فارسی (RTL)
- `ar` — العربية (RTL)
- `uz` — O‘zbekcha
- `tr` — Türkçe

## Rules

1. English remains the source content until each translation is reviewed.
2. Persian and Arabic must use true RTL layout, not translated LTR markup.
3. Language switching must preserve the current section/page where practical.
4. SEO metadata will be localized independently for each language.
5. No language branch is promoted to Production until Desktop, Mobile, RTL and link/navigation checks pass.

Translation files will be added incrementally after the language selector and direction system are validated in Preview.
