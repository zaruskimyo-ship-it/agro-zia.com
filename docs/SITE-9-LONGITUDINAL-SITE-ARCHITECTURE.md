# SITE-9 — Longitudinal Site Architecture

## Purpose
Establish the complete vertical skeleton of AGRO-ZIA before implementing deep internal business modules.

## Primary architecture
1. Home
2. About AGRO-ZIA
3. Agriculture & Products
4. Engineering & Technical Services
5. Projects & Case Studies
6. International Trade & Sourcing
7. ZARUS B2B Marketplace
8. Knowledge & Insights
9. Supplier Network
10. Customer Workspace
11. Supplier Workspace
12. Contact / Business Inquiry
13. Legal / Privacy / Terms

## Design principle
The site is built as a continuous business journey first. Each section has a stable information architecture, navigation anchor, CTA destination, and reserved area for later internal functionality. Detailed workflows are implemented only after the longitudinal structure is stable.

## Global navigation
Home · About · Products · Engineering · Projects · Trade · ZARUS · Knowledge · Contact

## Cross-site journeys
- Corporate visitor → service/product discovery → inquiry
- Buyer → ZARUS → catalog → supplier → RFQ → quote → transaction
- Supplier → Supplier Workspace → RFQ → quote → order fulfillment
- Returning customer → Customer Workspace → RFQs → quotes → orders → documents

## Shared UX requirements
- Mobile-first responsive layout
- RTL support for Persian and Arabic
- EN/RU/FA/AR/UZ/TR language foundation
- Consistent AGRO-ZIA/ZARUS visual identity
- Strong commercial CTAs without fabricated claims
- SEO-ready public sections; private workspaces noindex
- Accessibility-friendly semantic HTML
- Clear separation between public corporate content and authenticated commerce surfaces

## Implementation boundary
SITE-9 creates the structural shell only. Product intelligence, supplier operations, customer transaction logic, payments, QC, shipping, documents and other internal modules remain incremental implementation stages.

## Release safety
- Feature branch only
- Draft PR only
- `main` must remain untouched
- No Production deployment
- Runtime/Preview verification is required before release approval
