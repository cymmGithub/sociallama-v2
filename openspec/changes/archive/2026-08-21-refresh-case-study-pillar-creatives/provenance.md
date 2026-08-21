# Stock provenance — refresh-case-study-pillar-creatives

One stock photograph in this change. Everything else comes from Emilia's own
brand folders on Drive and is traced in `plan.md`.

Used under the [Pexels licence](https://www.pexels.com/license/): free for
commercial use, no attribution required, modification permitted. The
photographer is recorded anyway, the same way `refresh-case-study-covers`
recorded its covers.

| study | pillar | file | Pexels id | page | photographer | edited |
| --- | --- | --- | --- | --- | --- | --- |
| `fm-logistics` | #EMPLOYERBRANDING | `fm-logistics-employerbranding-2.jpg` | 10541203 | https://www.pexels.com/photo/a-man-in-a-suit-standing-by-the-windows-10541203/ | Jordan Bergendahl | cropped 3840×5760 → 3840×4800 (4:5, the pillar's house ratio), then encoded to 1080×1350 |

Replaces `fm-logistics-employerbranding-1.jpg` (a warehouse worker between
racking, also Pexels), which the review struck. The alt text describes the
person generically and never implies they work for FM Logistic:

- PL: Mężczyzna w ciemnym garniturze przy oknie biurowca, poprawia mankiet koszuli
- EN: A man in a dark suit standing by an office window, adjusting his shirt cuff

**Why this one.** Three candidates were rendered at the pillar's real render box
(240 px wide, 18 px corner, sand ground) and reviewed as an artifact; the owner
picked this one on 2026-08-21. The other two were #7643785 (dark suit at a rainy
window) and #7580766 (blue jacket reading a document).

**No API key.** `pexels_candidates.py` reads `PEXELS_API_KEY` from `.env.local`,
and this repo has none — `api.pexels.com` returns 401. The candidates were
sourced the way [[pexels-sourcing-no-api-key]] describes instead: the public
search page fetched with a browser User-Agent (`curl` works, `urllib` gets a 403
from Cloudflare even with the same header), and the direct `images.pexels.com`
URLs read straight out of that HTML. Queries used: `man suit office`,
`man in suit office window`, `businessman portrait office glass`,
`male professional portrait office`, all with `orientation=portrait`.
