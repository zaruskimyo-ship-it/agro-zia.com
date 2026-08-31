# Preview Route QA Checklist

- `/multilingual-preview?lang=en` shows Core Inquiry fields.
- `/multilingual-preview?lang=fa` shows the same fields with RTL/localized labels.
- The active `#contact` form does not use `mailto:`.
- Submit uses `POST /api/inquiries`.
- A successful response includes `request_number` and `created_at`.
- Email continuation appears only after successful API persistence response.
- `main` remains unchanged during QA.
