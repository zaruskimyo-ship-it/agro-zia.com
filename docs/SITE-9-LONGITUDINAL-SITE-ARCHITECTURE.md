# SITE-9 — Longitudinal Site Architecture

The AGRO-ZIA website is organized as a complete vertical business story first. Deep internal functions are deliberately deferred until the public structure and navigation are stable.

## Vertical page hierarchy
Home → About → Agriculture & Products → Engineering & Technical Services → Projects & Case Studies → International Trade & Sourcing → ZARUS B2B Marketplace → Knowledge & Insights → Supplier & Partner Network → Customer Workspace → Supplier Workspace → Business Inquiry → Legal.

## Global navigation
Home · About · Products · Engineering · Projects · Trade · ZARUS · Knowledge · Contact

## Connected journeys
Visitor → discovery → product/service → inquiry.
Buyer → ZARUS → Product → Supplier → RFQ → Quote → Negotiation → Order → Proforma → Payment → Trade Protection → QC → Shipping → Delivery.
Supplier → Supplier Workspace → RFQ → Quote → Order → Fulfillment.
Returning customer → Customer Workspace → RFQs → Quotes → Orders → Documents.

## Design foundation
Responsive/mobile-first layout, RTL Persian/Arabic, EN/RU/FA/AR/UZ/TR language foundation, consistent AGRO-ZIA/ZARUS identity, semantic HTML, accessibility-friendly navigation, SEO-ready public sections and noindex private workspaces.

## Internal implementation rule
Product APIs, supplier operations, customer transactions, payments, QC, shipping and document systems are implemented incrementally inside the established architecture rather than redefining the site structure at every stage.

## Release safety
This work remains on a feature branch and Draft PR. `main` and Production are not release targets until the complete site passes Preview/runtime/browser QA and receives explicit approval.
