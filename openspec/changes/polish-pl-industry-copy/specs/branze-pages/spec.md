# branze-pages — delta

## MODIFIED Requirements

### Requirement: Canonical industry list drives every surface

A single typed content module SHALL define the canonical industry list — order, PL/EN labels, PL/EN slugs — per the design D1 table (proof-first order, PL labels: Motoryzacja, Elektronika i AGD, Beauty, Zdrowie, Finanse, Zoologiczna, then Alkohole, Moda, Horeca, Hotele i Miejsca Wypoczynkowe, Nieruchomości i Deweloperzy, Rozrywka; EN labels unchanged). The overlay menu BRANŻE column, the footer OFERTA column, `generateStaticParams`, and the sitemap SHALL all derive from this module in this order, in both locales. Labels are bare nouns or elliptical adjectives — no "Branża" prefix anywhere. PL slugs stay as originally shipped (`automotive`, `health`, `fashion`, `petcare`, …) — a label rename never changes a URL.

#### Scenario: One list, all surfaces

- **WHEN** the menu overlay, footer, and sitemap render in either locale
- **THEN** all three present the same 12 industries in the same canonical order with identical labels and hrefs

#### Scenario: Alcohol not first

- **WHEN** the industry list renders anywhere
- **THEN** Alkohole/Alcohol appears at position 7, never first

#### Scenario: Renamed labels keep their routes

- **WHEN** the Motoryzacja, Zdrowie, Moda or Zoologiczna item is activated anywhere in the PL chrome
- **THEN** it navigates to `/branze/automotive`, `/branze/health`, `/branze/fashion` or `/branze/petcare` respectively, each returning 200

## ADDED Requirements

### Requirement: Polish industry copy carries no standalone English phrases

PL industry content (labels, pillars, chips, marquee entries, briefs, manifestos, meta titles and descriptions) SHALL NOT contain list items or headings written entirely in English. Entrenched loanwords and trade terms of art used within Polish phrasing are permitted (e.g. Beauty, Horeca, B2B, fintech, storytelling, content, influencer marketing, social commerce, UGC). Meta titles SHALL use naturally declined Polish forms of the industry name.

#### Scenario: No all-English list items

- **WHEN** any PL industry page renders its pillars, chips or marquee
- **THEN** no entry is a standalone English phrase (the former „Thought leadership", „Community", „Community marketing", „Trend-driven content" render as their Polish replacements)

#### Scenario: Copy follows the renamed label

- **WHEN** the PL Zdrowie page renders its brief
- **THEN** the industry is referred to in Polish („branża zdrowotna"), not as „branża health"

#### Scenario: Meta titles decline the industry name

- **WHEN** the PL meta title renders for a renamed industry
- **THEN** it reads „Social media dla branży motoryzacyjnej / zdrowotnej / modowej / zoologicznej" for Motoryzacja / Zdrowie / Moda / Zoologiczna respectively
