## MODIFIED Requirements

### Requirement: Footer column inventory

The footer SHALL render an invite block followed by three link columns sourced from the locale's chrome content, then a hardcoded contact column:

- **NAWIGACJA / NAVIGATION**: O NAS (`/o-nas`), BLOG (`/blog` in Polish, `/en/blog` in English), CASE STUDIES (`/case-studies`), KONTAKT (`/kontakt`) — and their English counterparts
- **USŁUGI / SERVICES**: the seven service detail pages in canonical order — Strategia, Content, Sprzedaż, Kampanie reklamowe, Kreacje & Wideo, Audyt i konsultacje, Influencer marketing — each linking to `/uslugi/<pl-slug>` or `/en/services/<en-slug>`
- **OFERTA / OFFER**: the canonical 12-industry list, each linking to its detail route (unchanged)
- **Contact column**: phone, email, addresses and the social links set (unchanged)

The USŁUGI column SHALL sit between NAWIGACJA and OFERTA.

#### Scenario: Both locales render four columns

- **WHEN** the footer renders on any Polish or English page
- **THEN** it shows NAWIGACJA/NAVIGATION, USŁUGI/SERVICES, OFERTA/OFFER and the contact column, in that order

#### Scenario: Every service page is reachable from the footer

- **WHEN** the USŁUGI or SERVICES column renders
- **THEN** it lists all seven services and each link returns 200 in the matching locale

#### Scenario: English footer links the English blog, not the Polish one

- **WHEN** the footer renders on an English page
- **THEN** the NAVIGATION column contains a BLOG link resolving to `/en/blog`
- **AND** it contains no link to `/blog` and no link to any category route

## Why this supersedes `add-industries-hub`

`add-industries-hub` specified the opposite — *"English footer omits blog surfaces … the NAVIGATION column contains no BLOG link and no link to `/blog` or any category route"* — and it was right when written. There was no English blog, so a BLOG link in English chrome could only have pointed at Polish articles, which is worse than omitting it.

This change creates the thing that scenario was compensating for. The reconciliation is deliberately narrow, and keeps everything in the original that is still true:

- **The BLOG link returns, pointing at `/en/blog`.** Only the English destination is new.
- **No link to `/blog` from English chrome.** The original concern — never route an English reader into Polish content — is untouched and still enforced.
- **Still no category routes in the footer.** English categories exist now, but the footer's job is the four top-level surfaces; enumerating four more category links would restate the hub's own navigation.
- **`add-industries-hub`'s other footer requirement is NOT modified.** "Hub pages are linked from the mobile menu only" still holds exactly: the live English footer links the seven `/en/services/*` and twelve `/en/industries/*` detail pages and neither index. That requirement and this one are independent, and only the blog scenario needed touching.

Verified against the deployed footer rather than against intent: it carries `/en/blog`, the seven service detail routes and the twelve industry detail routes, and neither `/en/services` nor `/en/industries` nor any `/en/blog/category/*` route.
