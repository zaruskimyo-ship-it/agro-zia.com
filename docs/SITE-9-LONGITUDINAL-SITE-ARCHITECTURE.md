# SITE-9 — Longitudinal Site Architecture

## Objective
Build the complete vertical skeleton of the AGRO-ZIA website first. Internal business modules will be filled in afterward, section by section.

## Main structure
1. Home
2. About AGRO-ZIA
3. Agriculture & Products
4. Engineering & Technical Services
5. Projects & Case Studies
6. International Trade & Sourcing
7. ZARUS B2B Marketplace
8. Knowledge & Insights
9. Supplier & Partner Network
10. Customer Workspace
11. Supplier Workspace
12. Business Inquiry / Contact
13. Legal / Privacy / Terms

## Global journey
Visitor → discovery → product/service → supplier or technical solution → inquiry → commercial workflow.

## Commerce journey
ZARUS → Product → Supplier → RFQ → Quote → Negotiation → Order → Proforma → Payment → Trade Protection → QC → Shipping → Delivery → Repeat business.

## Design system
A shared AGRO-ZIA visual foundation, responsive/mobile-first layout, RTL Persian/Arabic support, EN/RU/FA/AR/UZ/TR language foundation, semantic HTML, accessibility-friendly navigation, strong business CTAs, SEO-ready public pages, and noindex private workspaces.

## Implementation rule
This stage establishes the page hierarchy, navigation, visual rhythm, section destinations and cross-links. Detailed APIs, authentication, payments, logistics and operational workflows are completed afterward without changing the global information architecture unnecessarily.

## Release rule
Develop only on feature branches. Keep PRs Draft. Do not modify or deploy `main` until the full site is complete, Preview/runtime/browser QA passes, and the user explicitly approves release.
