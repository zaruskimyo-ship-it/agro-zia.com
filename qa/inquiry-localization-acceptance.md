# Agro-Zia Business Inquiry — Localization Acceptance

Target branch: `qa/inquiry-localization-fix`
Base commit: `d075b3e2b0647293777fb3187b547901617f7b7e`

## Required UI keys
- `contact_title`
- `contact_text`
- `name`
- `company`
- `country`
- `email`
- `phone`
- `interest`
- `specification_label`
- `quantity_label`
- `timing_label`
- `message`
- `submit`
- `form_note`

## Supported languages
EN / RU / FA / AR / UZ / TR

## Release gates
1. No unresolved `data-i18n` keys.
2. Submit remains POST `/api/inquiries`.
3. Validation remains enforced server-side.
4. Successful submission returns a new server-generated reference and timestamp.
5. D1 persistence must be true before confirmation.
6. No merge to `main` before Preview and regression QA are green.
