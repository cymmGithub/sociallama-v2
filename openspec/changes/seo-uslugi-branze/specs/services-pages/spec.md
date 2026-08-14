# services-pages — delta

## MODIFIED Requirements

### Requirement: Localized SEO surface for service pages

Each page SHALL emit locale-correct metadata, hreflang alternates to its counterpart with `x-default` pointing at the Polish URL, and all 16 URLs SHALL appear in the sitemap. Where a page's navigation label omits the terms the page is primarily about, its metadata title SHALL name them. On pages whose subject matches a measured search-demand phrase, the Polish metadata title SHALL lead with that phrase: `audyt-i-konsultacje` with "Audyt social media", `kampanie-reklamowe` with "Kampanie reklamowe w social media", and `influencer-marketing` with "Agencja influencer marketingu". These are metadata-only changes; page layout and section composition are unchanged.

#### Scenario: Hreflang pair

- **WHEN** `/uslugi/kreacje-wideo` or `/en/services/creative-video` renders
- **THEN** each emits alternates referencing the other and `x-default` referencing the Polish page

#### Scenario: Sitemap coverage

- **WHEN** the sitemap is generated
- **THEN** it lists the index and all seven service URLs in both locales

#### Scenario: Title carries terms the label drops

- **WHEN** `/uslugi/kampanie-reklamowe` renders
- **THEN** its metadata title leads with "Kampanie reklamowe w social media" and its metadata (title or description) still names SEO and Google Ads, which its navigation label does not

#### Scenario: Audit title leads with the demand phrase

- **WHEN** `/uslugi/audyt-i-konsultacje` renders
- **THEN** its metadata title begins with "Audyt social media"

#### Scenario: Influencer title names the agency phrase

- **WHEN** `/uslugi/influencer-marketing` renders
- **THEN** its metadata title contains "Agencja influencer marketingu"
