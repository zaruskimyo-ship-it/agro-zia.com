# Agro-Zia V3 Products Implementation

## Current architecture

- `products.html` remains the B2B category catalog.
- `product-detail.html` is the reusable verified-product detail framework.
- Category cards are connected dynamically by `locales/language-selector.js`.
- Links preserve the active language and pass a stable product slug.

## Product category slugs

1. `fertilizers`
2. `agricultural-products`
3. `greenhouse-products`
4. `irrigation-solutions`
5. `agricultural-equipment`
6. `custom-sourcing`

## Commercial principle

No public price, inventory, supplier claim, technical specification, origin or delivery promise is published until the underlying information is verified.

## QA sequence

Build → Preview → test all six languages → test RTL → test category links → test email/WhatsApp/Zarus → mobile/desktop review → user approval → merge.
