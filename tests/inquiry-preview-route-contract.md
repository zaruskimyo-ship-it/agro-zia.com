# Multilingual Inquiry Preview Contract

The QA preview route `/multilingual-preview` must:

- preserve the existing Agro-Zia homepage and all non-inquiry sections;
- replace only the legacy Business Inquiry form inside `#contact`;
- expose the Core Inquiry fields: product, company, specification, quantity, destination, timing, email, phone/WhatsApp, and additional requirements;
- submit with `POST /api/inquiries` rather than `mailto:`;
- use the `AGROZIA_DB`-backed server-generated request reference before offering email continuation;
- support `en`, `ru`, `fa`, `ar`, `uz`, and `tr` labels;
- keep `main` unchanged until preview and end-to-end validation are green.
