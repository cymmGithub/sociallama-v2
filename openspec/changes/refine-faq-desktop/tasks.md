## 1. Two-column ledger CSS

- [ ] 1.1 In `faq.module.css`, under the desktop media state: make `.item` a grid (`minmax(0, 1fr) minmax(0, 1.25fr)`, ~64px column gap) with `.summary` in column one and `.item::details-content` in `grid-column: 2; grid-row: 1`; reduce the summary's inner grid to numeral | question; absolutely position `.sign` at the row's right edge (`.item` as positioning context); zero the answer's numeral indent in column two and align its first baseline to the question's.
- [ ] 1.2 Raise the question clamp cap to 2.25rem and tune the slope against screenshots at 1280/1440/1728/1920 so common desktop widths approach the cap; leave the 1.15rem floor and the `<360px` heading easing untouched.
- [ ] 1.3 Fix the "in-house" mid-word break in question 02 (content-level no-break preferred, consistent with the PL ` ` convention; both locales).
- [ ] 1.4 `bun run check`.

## 2. Verification

- [ ] 2.1 Playwright desktop (1728px, plus 1280/1440/1920 spot-checks): open rows 01+03 → answer beside question, toggle far right, question at/near 2.25rem; compare against the approved mock (artifact `b2cc569f`, "2.25rem" variant).
- [ ] 2.2 Exercise the disclosure spec scenarios in the new layout: expand/collapse animation and rapid toggling, reduced-motion instant swap, expand-after-reveal (no clipping), focus-visible ring on the summary, and the no-JS page — answers all present and laid out.
- [ ] 2.3 Mobile viewport (390px): stacked rows byte-identical in behavior and size to today; EN homepage desktop: every question fits its column (flag any 4-line wrap as a copy question, don't revert layout).
- [ ] 2.4 Confirm FAQPage structured data is untouched (no content-source change beyond the no-break fix; if the fix used a joiner character, verify the JSON-LD text and visible text still match).
- [ ] 2.5 Show desktop + mobile screenshots for sign-off before commit.
