# English-locale capture brief

The 22 in-body images the audit marked `replace`. Each needs a **genuine capture
of the same screen from an English-locale account** — never the Polish PNG with
its text edited out. A retouched screenshot asserts an interface state that may
never have existed, and it ages badly (spec: *A replaced image is genuine, not
retouched*).

**If a screen no longer exists** — several of these are from 2019–2021 and the
products have changed — do not approximate it. Say so, and the verdict is
downgraded to `accept` with an alt gloss, with the reason recorded in
`image-audit.json`. A missing capture is a fine outcome; an invented one is not.

## How to hand captures back

Save the files anywhere in the repo, then write `content/media/en-replacements.json`
keyed by the **original** media id:

```json
{
  "49": { "file": "captures/fb-support-01.png", "alt": "Facebook Help Center — the Support Inbox entry point" }
}
```

Then:

```bash
bun run payload:repoint:en-images --prod            # dry run, shows every node it would touch
bun run payload:repoint:en-images --prod --apply
```

The script uploads each capture as a **new** media row and repoints only the
English Lexical tree. The Polish post keeps its Polish screenshots, which is
correct for a Polish reader. It refuses any id that is a cover or `ogImage`,
because those are shared across locales.

Match the original's framing and crop where you can — same screen region, same
zoom. Where the Polish original has a callout arrow or highlight box, reproduce
it in the same place.

---

## Facebook support walkthrough — 10 shots

Post: `jak-skontaktowac-sie-z-supportem-facebooka` ("How to contact Facebook support?")
Set the Facebook account language to English before starting, then walk the flow once.

| id | Screen | Must be legible |
|---|---|---|
| 49 | Entry point to the support flow | The first-step navigation the post tells the reader to click |
| 55 | Account/profile selector | The profile picker |
| 50 | Account list | Which accounts the flow offers |
| 56 | "Support and Help" section | The section heading and its options |
| 51 | Problem-category chooser | The category labels the reader must pick between |
| 52 | "Get help" screen | The help entry point |
| 53 | Live chat window | The chat UI and its prompt |
| 54 | Submission-sent confirmation | The confirmation wording |
| 57 | Feedback ("Report a problem") form | The form fields |
| 58 | Error state | The error message |

## Facebook ad invoices — 5 shots

Post: `gdzie-znalezc-faktury-za-reklamy-na-facebooku` ("Where to find invoices for Facebook ads?")
Meta Ads Manager → Billing & payments, English locale.

| id | Screen | Must be legible |
|---|---|---|
| 71 | Step 1 — entering billing | The nav path into Billing |
| 72 | Step 2 | The next control in the sequence |
| 73 | Step 3 | Date-range / transaction filter |
| 74 | Step 4 | The invoice row and its download affordance |
| 75 | Step 5 | The downloaded-invoice / final state |

## Facebook Pixel setup — 2 shots

Post: `jak-zainstalowac-piksel-facebooka-na-swojej-stronie`

| id | Screen | Must be legible |
|---|---|---|
| 149 | Events Manager menu | The menu items the reader is told to choose between |
| 150 | Pixel setup summary | The confirmation state proving the Pixel is live |

## Single shots — 5

| id | Post | Screen |
|---|---|---|
| 2 | `google-polaczylo-social-media-z-seo` | Google Search Console **property-type chooser** — both options and their descriptions must be readable, since the post tells the reader which to pick |
| 24 | `jak-dodac-rolke-probna-na-instagramie` | Instagram reel composer with the **trial-reel toggle** visible. Reproduce the callout arrow pointing at the toggle |
| 81 | `statystyki-twitter` | Twitter/X navigation menu, expanded — the post walks the reader to one item |
| 132 | `case-study-produkty-cukiernicze-brzesc` | *No capture possible* — 2019 reach figures from a Polish account. Handled by alt gloss instead; listed here only so the count reconciles |
| 133 | `case-study-produkty-cukiernicze-brzesc` | *Same as 132* |

> 132 and 133 are recorded as `accept` with `glossRequired`, not `replace` — they
> are historical analytics that cannot be re-captured and must not be recreated.
> The 20 rows above are the actual capture work.

---

## Not in this brief

**5 covers are blocked**, not missing: ids 28, 29, 31 (LAMÓWKA roundup cards) and
179, 180 (full-screen Polish Instagram dialogs). `cover` is not localized, so an
English version would land on the Polish post too. They carry
`blockedBy: "cover-relation-not-localized"` in the audit. Fixing them needs either
a localized `cover` relation or — for 28/29/31, which are authored artwork —
moving the headline text out of the pixels and rendering it from the already
translated fields.
