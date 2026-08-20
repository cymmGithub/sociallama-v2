# Cover plan — refresh-case-study-covers

One row per study. **This table is the rollback instruction**: case-study
content is database-only, so there is no `git revert` for a cover write.
The two `before` columns are what each database's row pointed at when it was
probed on 2026-08-20 — restore that filename to undo. They differ where a
study was repointed in one environment and not the other.

The two `now` columns differ too, and that is not a mistake: Payload's
`getSafeFileName` checks the local media directory for collisions even when
the bytes go to Vercel Blob, so the production run — made from the same
working copy as the development one — found every `-cover-2.jpg` already
written locally and bumped each index by one (⚠). The bytes are identical in
both environments; only the stored names diverge. `apply-cover-refresh.ts`
carries the production names in its `stored` field, which is what lets a
re-run report already-done rather than a stale plan.

Deferred for client material, untouched by this pass: dolina-charlotty, power-elements, ed-invest.

| study | verdict | dev before | prod before | dev now | prod now | alt PL / EN |
| --- | --- | --- | --- | --- | --- | --- |
| `a1-karting` | Pexels 29236424 | `a1-karting-cover.jpg` | `a1-karting-cover.jpg` | `a1-karting-cover-2.jpg` | `a1-karting-cover-3.jpg` ⚠ | Kierowca w kombinezonie w gokarcie / A driver in racing gear in a go-kart |
| `aquael` | Pexels 30590631 | `aquael-cover.jpg` | `aquael-cover.jpg` | `aquael-cover-2.jpg` | `aquael-cover-3.jpg` ⚠ | Rozświetlone akwarium, przed nim sylwetka osoby / A lit aquarium with a person silhouetted in front of it |
| `ariadna` | Pexels 6684255 | `ariadna-cover-2.jpg` | `ariadna-cover-2.jpg` | `ariadna-cover-3.jpg` | `ariadna-cover-4.jpg` ⚠ | Dłoń wypełniająca papierową ankietę ołówkiem / A hand filling in a paper questionnaire with a pencil |
| `breville` | Pexels 35546720 | `breville-cover.jpg` | `breville-cover.jpg` | `breville-cover-2.jpg` | `breville-cover-3.jpg` ⚠ | Deser podany na białym talerzu / A plated dessert on a white plate |
| `dynamic-development` | Pexels 4458205 | `dynamic-development-cover.jpg` | `dynamic-development-cover.jpg` | `dynamic-development-cover-2.jpg` | `dynamic-development-cover-3.jpg` ⚠ | Rysunki architektoniczne rzutu budynku / Architectural floor plan drawings |
| `engie` | Pexels 17863792 | `engie-cover.jpg` | `engie-cover.jpg` | `engie-cover-2.jpg` | `engie-cover-3.jpg` ⚠ | Turbiny wiatrowe na łące o wschodzie słońca / Wind turbines in a meadow at sunrise |
| `entelo` | Pexels 7587803 | `entelo-cover-3.jpg` | `entelo-cover-3.jpg` | `entelo-cover-4.jpg` | `entelo-cover-5.jpg` ⚠ | Pokój dziecięcy z zielonymi meblami / A child's room with green furniture |
| `faktoria-win` | Pexels 9658801 | `faktoria-win-cover-3.jpg` | `faktoria-win-cover-3.jpg` | `faktoria-win-cover-4.jpg` | `faktoria-win-cover-5.jpg` ⚠ | Butelki wina na sklepowych półkach / Wine bottles on shop shelves |
| `fm-logistics` | Pexels 34902065 | `fm-logistics-cover.jpg` | `fm-logistics-cover.jpg` | `fm-logistics-cover-2.jpg` | `fm-logistics-cover-3.jpg` ⚠ | Ciężarówka na autostradzie w górskim krajobrazie / A truck on a highway in a mountain landscape |
| `foodsaver` | Pexels 6978245 | `foodsaver-cover.jpg` | `foodsaver-cover.jpg` | `foodsaver-cover-2.jpg` | `foodsaver-cover-3.jpg` ⚠ | Zbliżenie świeżych owoców: truskawki, maliny, jabłko i mango / A close-up of fresh fruit — strawberries, raspberries, apple and mango |
| `irobot` | client-supplied photo (2026-08-20) | `irobot-cover.jpg` | `irobot-cover.jpg` | `irobot-cover-2.jpg` | `irobot-cover-3.jpg` ⚠ | Robot sprzątający na dywanie obok stolika z przekąskami / A robot vacuum on a rug beside a coffee table with snacks |
| `julius-meinl` | Pexels 8218593 | `julius-meinl-cover-2.jpg` | `julius-meinl-cover-2.jpg` | `julius-meinl-cover-3.jpg` | `julius-meinl-cover-4.jpg` ⚠ | Zbliżenie palonych ziaren kawy / A close-up of roasted coffee beans |
| `kbp` | Pexels 15325468 | `kbp-cover.jpg` | `kbp-cover.jpg` | `kbp-cover-2.jpg` | `kbp-cover-3.jpg` ⚠ | Publiczność na sali konferencyjnej / An audience in a conference hall |
| `kohersen` | Pexels 32149261 | `kohersen-cover.jpg` | `kohersen-cover.jpg` | `kohersen-cover-2.jpg` | `kohersen-cover-3.jpg` ⚠ | Danie podane na białym talerzu / A plated dish on a white plate |
| `kontigo` | Pexels 4920513 | `kontigo-cover-5.jpg` | `kontigo-cover-5.jpg` | `kontigo-cover-6.jpg` | `kontigo-cover-7.jpg` ⚠ | Dwie kobiety nakładające krem na twarz / Two women applying face cream |
| `laurastar` | client-supplied photo (2026-08-20) | `laurastar-cover.jpg` | `laurastar-cover.jpg` | `laurastar-cover-2.jpg` | `laurastar-cover-3.jpg` ⚠ | Parownica do ubrań na łóżku, w tle otwarta garderoba / A garment steamer on a bed with an open wardrobe behind it |
| `mazurska-manufaktura-alkoholi` | Pexels 36322544 | `mazurska-manufaktura-alkoholi-cover.jpg` | `mazurska-manufaktura-alkoholi-cover.jpg` | `mazurska-manufaktura-alkoholi-cover-2.jpg` | `mazurska-manufaktura-alkoholi-cover-3.jpg` ⚠ | Dwie szklanki whisky na ciemnym blacie / Two glasses of whisky on a dark counter |
| `mercator` | client-supplied photo (2026-08-20) | `mercator-cover.jpg` | `mercator-cover.jpg` | `mercator-cover-2.jpg` | `mercator-cover-3.jpg` ⚠ | Pudełka rękawic nitrylowych na biurku / Boxes of nitrile gloves on a desk |
| `n-energia` | Pexels 17965455 | `n-energia-cover.jpg` | `n-energia-cover.jpg` | `n-energia-cover-2.jpg` | `n-energia-cover-3.jpg` ⚠ | Panele fotowoltaiczne na dachu domu / Photovoltaic panels on a house roof |
| `ozgasl` | Pexels 8986132 | `ozgasl-cover.jpg` | `ozgasl-cover.jpg` | `ozgasl-cover-2.jpg` | `ozgasl-cover-3.jpg` ⚠ | Mechanik przy samochodzie na podnośniku w warsztacie / A mechanic working on a car on a lift in a workshop |
| `personal-effect` | Pexels 34016409 | `personal-effect-cover-3.jpg` | `personal-effect-cover-3.jpg` | `personal-effect-cover-4.jpg` | `personal-effect-cover-5.jpg` ⚠ | Fotel w spokojnym wnętrzu w ciepłym świetle / An armchair in a calm room in warm light |
| `polomarket` | Pexels 8805471 | `polomarket-cover.jpg` | `polomarket-cover.jpg` | `polomarket-cover-2.jpg` | `polomarket-cover-3.jpg` ⚠ | Kobieta przy stoisku z warzywami i owocami / A woman at a fruit and vegetable stand |
| `produkty-cukiernicze-brzesc` | Pexels 17292509 | `produkty-cukiernicze-brzesc-cover-3.jpg` | `image_crop_1200x800_w1200_q0.9.jpg` | `produkty-cukiernicze-brzesc-cover-4.jpg` | `produkty-cukiernicze-brzesc-cover-5.jpg` ⚠ | Miska zupy na zastawionym stole / A bowl of soup on a laid table |
| `rabkoland` | Pexels 682347 | `rabkoland-cover-3.jpg` | `rabkoland-cover-3.jpg` | `rabkoland-cover-4.jpg` | `rabkoland-cover-5.jpg` ⚠ | Rozświetlona karuzela w parku rozrywki / A lit carousel at an amusement park |
| `skibooking` | Pexels 30161216 | `skibooking-cover.jpg` | `skibooking-cover.jpg` | `skibooking-cover-2.jpg` | `skibooking-cover-3.jpg` ⚠ | Stok narciarski z wyciągiem i narciarzami / A ski slope with a lift and skiers |
| `skrzat` | Pexels 7991319 | `skrzat-cover.jpg` | `skrzat-cover.jpg` | `skrzat-cover-2.jpg` | `skrzat-cover-3.jpg` ⚠ | Puste czerwone fotele w sali kinowej / Empty red seats in a cinema auditorium |
| `stadler-form` | recrop of the existing cover (faces excluded) | `stadler-form-cover.jpg` | `stadler-form-cover.jpg` | `stadler-form-cover-2.jpg` | `stadler-form-cover-3.jpg` ⚠ | Oczyszczacz powietrza na podłodze studia jogi / An air purifier on the floor of a yoga studio |
