The preview-route change is validated by source-level contract checks plus deployment QA.

Required deployment checks:

1. GET `/multilingual-preview?lang=en` renders the qualified inquiry fields.
2. GET `/multilingual-preview?lang=fa` renders the same Core Inquiry structure with RTL/localized labels.
3. No `mailto:` form action remains active in the rendered `#contact` form.
4. Submit sends `POST /api/inquiries`.
5. Successful submission returns a server-generated `request_number` and `created_at`.
6. D1 contains the submitted inquiry with status `received`.
7. Email-draft continuation is offered only after successful API response.
8. `main` remains unchanged during QA.
