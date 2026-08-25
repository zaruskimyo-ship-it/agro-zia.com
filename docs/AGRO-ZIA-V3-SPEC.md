# Agro-Zia V3 — Product & Website Specification

**Status:** Development specification
**Production branch:** `main` (protected / unchanged)
**Development branch:** `feature/home-v3`

## 1. Brand Positioning

**AGRO-ZIA**  
**Agriculture • Engineering • Trade**

Primary message:

> Connecting Agricultural Products, Expertise and Markets.

Hero headline:

> Agricultural Solutions Beyond Borders

Supporting text:

> Agricultural products, engineering expertise and international trade solutions connecting producers, suppliers and markets.

The website is a B2B commercial platform, not merely a corporate brochure.

## 2. Core Business Pillars

1. **Products** — Agricultural products and inputs
2. **Engineering** — Technical and engineering solutions
3. **Projects** — Agricultural and greenhouse projects
4. **Trade** — International sourcing and market development

## 3. Main Navigation

Desktop and mobile navigation:

- Home
- About
- Products
- Engineering
- Projects
- Trade
- Knowledge
- Contact

Mobile navigation uses a hamburger menu.

## 4. Home Page Structure

1. Header / navigation
2. Hero
3. Four business pillars
4. Products overview
5. Engineering overview
6. Projects / case studies preview
7. International Trade / target markets
8. Zarus supply-network integration
9. Knowledge preview
10. Business Inquiry CTA
11. Footer

## 5. Hero

Headline:

> Agricultural Solutions Beyond Borders

Supporting message:

> Agricultural products, engineering expertise and international trade solutions connecting producers, suppliers and markets.

Primary CTA:

> Explore Our Solutions

Secondary CTA:

> Start a Business Inquiry

The hero must communicate Agro-Zia's identity within a few seconds and remain readable on mobile.

## 6. Products

Initial categories:

- Fertilizers
- Agricultural Inputs
- Agricultural Products
- Greenhouse Products
- Irrigation & Equipment

No public pricing in V3. Product pages/cards should use:

- Request Product Information
- Request a Quote

Future product pages may include specification, origin, packaging, MOQ, certificates, availability and target markets where verified.

## 7. Engineering

Initial service areas:

- Greenhouse development
- Agricultural project planning
- Technical assessment
- Irrigation solutions
- Agricultural production systems
- Project supervision
- Technical consulting

Claims must remain factual and based on demonstrable experience; avoid unsupported marketing claims.

## 8. Projects

Projects will evolve into case studies with this structure:

- Location
- Client / Partner (when publishable)
- Challenge
- Solution
- Technical Scope
- Results
- Gallery

Only verified project information should be published.

## 9. International Trade

Initial target-market presentation may include:

- Iran
- Uzbekistan
- Türkiye
- Iraq

Use wording such as **Target Markets** or **Markets We Connect** unless actual operations in a country can be substantiated. Do not imply an active legal or commercial presence where none exists.

## 10. Business Inquiry / Lead Generation

Replace a basic contact-only concept with a B2B inquiry flow.

Fields:

- Inquiry type: Product / Engineering Service / Agricultural Project / Import-Export / Partnership / Other
- Name
- Company
- Country
- Email
- WhatsApp / Phone
- Message
- Optional attachment (future backend stage)

CTA:

> Submit Business Inquiry

The static V3 should keep the frontend ready for a future lead-management backend.

## 11. Knowledge

Initial categories:

- Agricultural Technology
- Fertilizers
- Greenhouse Management
- International Agriculture
- Market Insights

The section is initially lightweight but must be structured for future SEO content.

## 12. About

Focus on:

- Technical Experience
- Agricultural Knowledge
- International Perspective
- Business Partnerships

Use factual, non-exaggerated language.

## 13. Zarus Integration

**Zarus.ir** is an Agro-Zia-related agricultural supply-network business/platform, not merely a generic online store.

Concept:

> Suppliers → Zarus → Agricultural Customers

Zarus should be presented as an agricultural supply network / supply-chain platform that complements Agro-Zia's B2B trade, engineering and market-development activities.

The exact legal relationship and wording should avoid unsupported claims. A concise homepage reference may be:

> **Zarus — Agricultural Supply Network**
> Connecting agricultural suppliers with professional customers.

The Zarus link should be clearly separated from Agro-Zia's core navigation while remaining discoverable.

## 14. Footer

Brand:

> AGRO-ZIA  
> Agriculture • Engineering • Trade

Primary links:

- Products
- Engineering
- Projects
- International Trade
- Knowledge

Markets:

- Iran
- Uzbekistan
- Türkiye
- Iraq

Contact:

- info@agro-zia.com
- export@agro-zia.com

Copyright:

> © 2026 Agro-Zia

## 15. Technical Architecture

V3 remains a lightweight static website:

- HTML
- CSS
- JavaScript only where useful
- GitHub repository
- Cloudflare deployment
- `agro-zia.com`

Do not introduce WordPress, a database, or a heavy ecommerce/backend system at this stage.

The frontend should be structured so that a backend, CRM and lead-management layer can be added later without redesigning the entire information architecture.

## 16. SEO / Accessibility Baseline

V3 should include:

- One clear H1
- Page title
- Meta description
- Semantic headings
- Descriptive link text
- Image alt text when images are introduced
- Mobile-first responsive layout
- Good keyboard/focus behavior
- Fast-loading assets
- Canonical URL when appropriate
- Open Graph metadata
- Structured data where appropriate after content is finalized

## 17. Development Rules

- Never modify `main` during V3 development.
- All V3 changes go to `feature/home-v3`.
- Review changes before merge.
- No merge to `main` without explicit owner approval.
- Prefer small, logically grouped commits.
- Keep the current stable version recoverable through Git history.

## 18. V3 Success Criteria

The first screen should make clear:

1. What Agro-Zia is.
2. What it supplies.
3. What expertise it provides.
4. That it connects markets internationally.
5. How a B2B customer can start an inquiry.

The site should feel credible, restrained and international rather than like a generic ecommerce template.
