# Business Inquiry Localization Patch Plan

Branch: `qa/inquiry-localization-fix`
Base: `d075b3e2b0647293777fb3187b547901617f7b7e`

## Confirmed defect
The injected form uses `contact_title`, `contact_text`, and `form_note`, while the current `copy` objects expose `note` but not those three keys.

## Required minimal patch
For each language `en`, `ru`, `fa`, `ar`, `uz`, `tr`, add:
- `contact_title`
- `contact_text`
- `form_note`

`form_note` should map to the existing `note` text unless a language-specific refinement is required. `contact_title` and `contact_text` should use the corresponding canonical multilingual-preview contact/inquiry wording.

## Safety constraints
- Do not alter D1/API/reference logic.
- Do not alter homepage routing.
- Do not change email routing.
- Keep the patch limited to localization data.
- Run syntax/build validation after the code patch.
- Do not merge to `main` until Preview and regression QA are green.
