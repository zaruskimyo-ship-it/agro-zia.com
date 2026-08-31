# Agro-Zia — Multilingual Preview Inquiry Route Fix

This QA preview candidate forces `/multilingual-preview` to load the canonical `inquiry-integration.js` B2B inquiry layer with a versioned script URL and no-cache HTML response.

Core Inquiry remains independent of ADMIN_TOKEN and uses `AGROZIA_DB`.

QA only. Do not promote to main until Preview and Submit → API → D1 validation pass.