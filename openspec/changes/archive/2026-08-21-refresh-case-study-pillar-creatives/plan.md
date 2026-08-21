# Per-image plan — refresh-case-study-pillar-creatives

Built from `plan-source.py` (the approved comparison sheet) checked against the
dev database on 2026-08-21 (47 published studies, 257 pillar creatives, **zero
pillars where PL and EN disagree** — every write below is the same write twice).

Source files: Drive root `19Ti6Y3DOf7kZraG95q1AVb14TqtN1b33`, pulled by folder
id. 87 files across 15 brand folders, plus `Pracuj/blur 2`. `Source` names the
Drive file; the leading digits are Instagram's export id and identify the file
uniquely inside its folder.

**Verdicts:** `keep` (stays, untouched) · `drop` (detached, row kept) ·
`add` (new media row) · `crop` (bytes replaced in place on the existing row,
id unchanged) · `replace-bytes` (same, for the cover).

## Counts

| | |
|---|---|
| studies touched | 24 |
| new media documents | 87 + 1 stock + 1 cover = 89 |
| detached creatives | 91 |
| in-place byte replacements | 7 crops |
| cover swaps | 1 (power-elements) |
| pillars left with no media | **14** |

## Pillars that end up text-only

The proposal said five; the sheet's drops actually leave fourteen. All render
through the existing `pillarSolo` branch, per the spec requirement in this
change. No copy is touched.

| study | pillar | why |
|---|---|---|
| a1-karting | #VIDEO | gallery-7 dropped, no replacement supplied |
| asus | #YOUTUBE | gallery-1 (Copilot) dropped |
| asus | #ANIMACJE | gallery-5 dropped |
| asus | #KARUZELE | gallery-7 + 8 dropped |
| dolina-charlotty | #AUTENTYCZNOŚĆ | gallery-2 (children) dropped |
| engie | #PERSONALBRANDING (pillar 2) | gallery-3 (Robert Kiszka) dropped; the second #PERSONALBRANDING pillar keeps gallery-4 |
| kbp | #PROMOCJAWYDARZENIA | both graphics dropped — the study ends with no creatives at all |
| kontigo | #LIVE | gallery-4 dropped |
| las-vegans | #WEBINARY | gallery-1 + 2 dropped as illegible |
| las-vegans | #WYNIKI_I_SUKCES | gallery-9 + 10 dropped as illegible |
| mercator | #MODERACJA | gallery-8 dropped |
| power-elements | #COMMUNITY | gallery-7 dropped |
| stadler-form | #MODERACJA | gallery-3 + 4 dropped |
| vobis | #MODERACJA | gallery-4 dropped |

## Interpretive calls recorded here, not invented at apply time

- **engie** has two pillars carrying `#STRUKTURA_TREŚCI` and the sheet lists
  four files for "the pillar". Split by heading: pillar 0 *Komunikacja
  ekspercka na LinkedInie* takes the two corporate posts (Transformacja
  energetyczna, Roland-Garros); pillar 1 *Edukacja i lokalne zaangażowanie na
  Facebooku* takes the two employee/community posts (Dzień Facility
  Management, honorary blood donors).
- **volvo** likewise has two `#STRUKTURA TREŚCI` pillars. The sheet's swaps are
  like-for-like on the current files, so positions are unchanged; the extra
  file it says to "dodać" (Styl i równowaga) goes on pillar 0.
- **volvo** has no `*-gallery-N` files at all, so its new files start at
  `volvo-gallery-1.jpg`. Its older creatives keep their semantic names.
- **personal-effect #SESJA** reads *Zorganizowanie sesji zdjęciowej* and its two
  photographs are replaced with illustrated quote cards, because the sheet's
  rule for this brand is "every shot of the therapist goes". The pillar then
  talks about a photo session while showing illustrations. Flagged, not fixed:
  the copy is content nobody asked to change.
- **a1-karting #HUMOR** receives a contest creative (200 zł voucher). That is
  what the sheet assigns; the tag no longer describes it.
- **power-elements**: three of the four screenshots carry Instagram's carousel
  arrows over the creative. They cannot be cropped away without eating the
  artwork, so they stay — the screenshot reads as a screenshot.
- **volvo `konkurs 1`** shows two identifiable children. It comes from Emilia's
  own folder, same clearance assumption as every other supplied face.

---

## a1-karting

| pillar | verdict | current | new | source |
|---|---|---|---|---|
| 0 #TWÓJTORDO | drop→add | a1-karting-gallery-1-cut.webp | a1-karting-gallery-8.jpg | a1karting/493327521…_n.jpg |
| 1 #HUMOR | drop→add | a1-karting-gallery-2-cut.webp | a1-karting-gallery-9.jpg | a1karting/754015532…_n.jpg |
| 2 #EDUKACJA | drop→add | a1-karting-gallery-3-cut.webp, a1-karting-gallery-4-cut.webp | a1-karting-gallery-10.jpg, a1-karting-gallery-11.jpg | a1karting/Zrzut…16.33.30.png, Zrzut…16.34.33.png |
| 3 #DOŚWIADCZENIA | drop→add | a1-karting-gallery-5-cut.webp, a1-karting-gallery-6-cut.webp | a1-karting-gallery-12.jpg, a1-karting-gallery-13.jpg | a1karting/712269032…_n.jpg, 772178535…_n.jpg |
| 4 #VIDEO | drop | a1-karting-gallery-7-cut.webp | — | — |

- `a1-karting-gallery-8.jpg`
  - PL: Kreacja A1Karting z kierowcą w kasku za kierownicą gokarta i hasłem „Twój TOR do niezapomnianych wakacji dla dziecka!”
  - EN: A1Karting creative showing a helmeted driver at the wheel of a go-kart, headlined "Twój TOR do niezapomnianych wakacji dla dziecka!" ("Your TRACK to an unforgettable holiday for your child").
- `a1-karting-gallery-9.jpg`
  - PL: Konkursowa kreacja A1Karting z hasłem „KONKURS NA FACEBOOKU” i voucherem o wartości 200 zł do wygrania
  - EN: A1Karting contest creative headlined "KONKURS NA FACEBOOKU" ("Facebook contest"), with a 200 zł voucher as the prize.
- `a1-karting-gallery-10.jpg`
  - PL: Kadr z rolki A1Karting — osoba w kombinezonie i kasku trzyma cztery flagi wyścigowe, napis „Szybkie przypomnienie, co która flaga oznacza!”
  - EN: Frame from an A1Karting reel: a person in racing overalls and helmet holding four racing flags, captioned "Szybkie przypomnienie, co która flaga oznacza!" ("A quick reminder of what each flag means").
- `a1-karting-gallery-11.jpg`
  - PL: Kadr z rolki A1Karting z gokartem na torze i napisami „Jeździsz 10 okrążeń i czas stoi w miejscu?” oraz „Poznaj 3 najczęstsze błędy!”
  - EN: Frame from an A1Karting reel showing a go-kart on the track, captioned "Jeździsz 10 okrążeń i czas stoi w miejscu?" ("Ten laps in and time stands still?") and "Poznaj 3 najczęstsze błędy!" ("Learn the 3 most common mistakes").
- `a1-karting-gallery-12.jpg`
  - PL: Kreacja A1Karting z pustym torem gokartowym i hasłem „Wakacyjna szkoła gokartowa dla Twojego dziecka”
  - EN: A1Karting creative showing an empty go-kart track, headlined "Wakacyjna szkoła gokartowa dla Twojego dziecka" ("Holiday go-kart school for your child").
- `a1-karting-gallery-13.jpg`
  - PL: Kreacja A1Karting z kierowcą świętującym w gokarcie i hasłem „Event na pełnym gazie”
  - EN: A1Karting creative showing a driver celebrating in a go-kart, headlined "Event na pełnym gazie" ("An event at full throttle").

## ariadna

| pillar | verdict | current | new | source |
|---|---|---|---|---|
| 0 #WIDEO_REKLAMOWE | drop→add | ariadna-gallery-1-cut.webp, ariadna-gallery-2.jpg, ariadna-gallery-3.jpg | ariadna-gallery-11.jpg, ariadna-gallery-12.jpg | ariadna/Zrzut…15.54.09.png, Zrzut…15.54.30.png |
| 1 #KAMPANIA | drop→add | ariadna-gallery-4-cut.webp | ariadna-gallery-13.jpg | ariadna/Zrzut…15.55.14.png |
| 2 #INFLUENCERKA | keep | ariadna-gallery-5.jpg | — | — |
| 3 #OBSERWUJACY | keep + drop | ariadna-gallery-6-cut.webp (keep), ariadna-gallery-9-cut.webp (drop, duplicate of gallery-3) | — | — |
| 4 #WYNIKI | drop→add | ariadna-gallery-10.jpg | ariadna-gallery-14.jpg | ariadna/Zrzut…15.55.53.png |

- `ariadna-gallery-11.jpg`
  - PL: Kadr z filmu Panelu Badawczego Ariadna — kobieta przy stole w mieszkaniu, napis „Tylko jedna ankieta i już do ciebie idę”
  - EN: Frame from an Ariadna Research Panel video: a woman at a dining table, captioned "Tylko jedna ankieta i już do ciebie idę" ("Just one survey and I'm on my way").
- `ariadna-gallery-12.jpg`
  - PL: Kadr z filmu Ariadny — kobieta w słuchawkach nad laptopem, napis „POV: otwieram stronę Panelu Badawczego Ariadna i mam nowe ankiety do wypełnienia”
  - EN: Frame from an Ariadna video: a woman in headphones over a laptop, captioned "POV: otwieram stronę Panelu Badawczego Ariadna i mam nowe ankiety do wypełnienia" ("POV: I open the Ariadna Research Panel and there are new surveys to fill in").
- `ariadna-gallery-13.jpg`
  - PL: Kadr z filmu Ariadny — twórczyni mówi do kamery, napis „czym tak naprawdę jest Panel Badawczy Ariadna”
  - EN: Frame from an Ariadna video: a creator talking to camera, captioned "czym tak naprawdę jest Panel Badawczy Ariadna" ("what the Ariadna Research Panel really is").
- `ariadna-gallery-14.jpg`
  - PL: Kadr z filmu Ariadny — twórczyni do kamery, podpis „Otwieram oczy na rzeczy, które są prawdą o Panelu Badawczym Ariadna”
  - EN: Frame from an Ariadna video: a creator talking to camera, captioned "Otwieram oczy na rzeczy, które są prawdą o Panelu Badawczym Ariadna" ("I'm opening eyes to the truth about the Ariadna Research Panel").

## asus — removals only

| pillar | verdict | current |
|---|---|---|
| 0 #YOUTUBE | drop | asus-gallery-1-cut.webp |
| 1 #FACEBOOK | keep | asus-gallery-3.jpg, asus-gallery-4-anon.jpg |
| 2 #ANIMACJE | drop | asus-gallery-5-cut.webp |
| 3 #REELS | keep | asus-gallery-6-cut.webp |
| 4 #KARUZELE | drop | asus-gallery-7.jpg, asus-gallery-8.jpg |

"babka i facet obok siebie" is read as the two adjacent cards in #FACEBOOK,
which are the ones kept.

## breville

| pillar | verdict | current | new | source |
|---|---|---|---|---|
| 0 #SPRZEDAŻ | drop→add | breville-gallery-1.jpg | breville-gallery-7.jpg, breville-gallery-8.jpg | breville/594451694…_n.jpg, 614379847…_n.jpg |
| 1 #EKSPERCKOŚĆ | drop→add | breville-gallery-2.jpg | breville-gallery-9.jpg | breville/684163416…_n.jpg |
| 2 #KUCHNIADOBREGOSMAKU | keep | breville-gallery-3/4/5.jpg | — | — |
| 3 #ZAANGAŻOWANIE | drop→add | breville-gallery-6.jpg | breville-gallery-10.jpg, breville-gallery-11.jpg, breville-gallery-12.jpg | breville/629603811…_n.jpg, 658242185…_n.jpg, Zrzut…15.13.56.png |

- `breville-gallery-7.jpg`
  - PL: Kreacja Breville z frytkownicą beztłuszczową i czerwoną peleryną, hasło „Nie każdy superbohater nosi pelerynę”, podpis „niektórzy mają dwie komory i 10 programów”
  - EN: Breville creative showing an air fryer with a red cape, headlined "Nie każdy superbohater nosi pelerynę" ("Not every superhero wears a cape") and captioned "niektórzy mają dwie komory i 10 programów" ("some have two baskets and 10 programmes").
- `breville-gallery-8.jpg`
  - PL: Kreacja Breville z frytkownicą na tle rozmytej imprezy z konfetti, hasło „Nie robi hałasu, a robi robotę”
  - EN: Breville creative showing an air fryer against a blurred party with confetti, headlined "Nie robi hałasu, a robi robotę" ("It makes no noise, it does the work").
- `breville-gallery-9.jpg`
  - PL: Kreacja Breville z czerwoną piramidą potrzeb, w każdym poziomie napis „TOSTY”, nagłówek „Moje potrzeby w życiu”
  - EN: Breville creative showing a red pyramid of needs with "TOSTY" ("toasties") on every tier, headlined "Moje potrzeby w życiu" ("My needs in life").
- `breville-gallery-10.jpg`
  - PL: Kreacja Breville z grupą kibiców przed telewizorem i hasłem „Ja bym zrobił to lepiej”, podpis „Czyli co można powiedzieć gotując obiad i oglądając Igrzyska?”
  - EN: Breville creative showing a group of armchair fans, headlined "Ja bym zrobił to lepiej" ("I'd have done it better") over "Czyli co można powiedzieć gotując obiad i oglądając Igrzyska?" ("Things you say while cooking dinner and watching the Games").
- `breville-gallery-11.jpg`
  - PL: Kreacja Breville z kobietą pijącą kawę i hasłem „Picie kawy wydłuża życie”, podpis „Ja: W takim razie planuję żyć wiecznie”
  - EN: Breville creative showing a woman drinking coffee, headlined "Picie kawy wydłuża życie" ("Coffee makes you live longer") over "Ja: W takim razie planuję żyć wiecznie" ("Me: then I plan to live forever").
- `breville-gallery-12.jpg` — screenshot, cropped to the creative
  - PL: Kreacja Breville z filiżanką odwróconą nad spodkiem i fusami po kawie, hasło „ANDRZEJKI? Nie wróż z fusów… zrób espresso!”
  - EN: Breville creative showing a cup tipped over its saucer with coffee grounds, headlined "ANDRZEJKI? Nie wróż z fusów… zrób espresso!" ("St Andrew's Eve? Don't read the grounds — pull an espresso").

## dolina-charlotty — removal and crops

| pillar | verdict | current | note |
|---|---|---|---|
| 1 #AUTENTYCZNOŚĆ | drop | dolina-charlotty-gallery-2-cut.webp | children; no replacement |
| 2 #ZAUFANIE | crop | dolina-charlotty-gallery-3-cut.webp | cut the phone mockup, keep the story |
| 3 #DOŚWIADCZENIA | crop | dolina-charlotty-gallery-4-cut.webp | cut the phone mockup, keep the post creative |
| 4 #VIDEO | crop | dolina-charlotty-gallery-5-cut.webp | cut the phone mockup, keep the reel frame |

The three cropped rows keep their ids and need new alt text, because the
current alt describes a phone ("w telefonie") that will no longer be there:

- `dolina-charlotty-gallery-3-cut.webp`
  - PL: Relacja na Instagramie Doliny Charlotty — lama z Zoo Charlotta i ankieta „Będziecie?” z wynikiem 71% głosów na „Tak!”
  - EN: Dolina Charlotty Instagram story: a llama from Zoo Charlotta with a poll "Będziecie?" ("Will you come?") answered 71% "Tak!" ("Yes").
- `dolina-charlotty-gallery-4-cut.webp`
  - PL: Reklamowa kreacja Dolina Charlotty „Bilety do ZOO za pół ceny!” z dwoma lemurami
  - EN: Dolina Charlotty ad creative with two lemurs, headlined "Bilety do ZOO za pół ceny!" ("Zoo tickets at half price").
- `dolina-charlotty-gallery-5-cut.webp`
  - PL: Kadr z reelsa Doliny Charlotty — ujęcie nad wodą z hasłem „Odwiedź Dolinę Charlotty”
  - EN: Frame from a Dolina Charlotty reel: a shot over the water with the line "Odwiedź Dolinę Charlotty" ("Visit Dolina Charlotty").

## dynamic-development

| pillar | verdict | current | new | source |
|---|---|---|---|---|
| 0 #TIKTOK | keep + add | dynamic-development-gallery-1-cut.webp (keep) | dynamic-development-gallery-7.jpg | dynamic development/Zrzut…16.45.56.png |
| 2 #NAGRANIA_WIDEO | drop→add | dynamic-development-gallery-4-cut.webp, -gallery-5-cut.webp | dynamic-development-gallery-8.jpg, dynamic-development-gallery-9.jpg | Zrzut…16.45.43.png, Zrzut…16.46.07.png |
| 3 #SPRZEDAŻ | drop→add | dynamic-development-gallery-6-cut.webp | dynamic-development-gallery-10.jpg | Zrzut…16.46.26.png |

- `dynamic-development-gallery-7.jpg`
  - PL: Kadr z filmu Dynamic Development — kobieta w czapce Mikołaja z prezentową torbą, napis „Ja w wigilię, kiedy żaden prezent nie wygląda jak własne mieszkanie”
  - EN: Frame from a Dynamic Development video: a woman in a Santa hat holding a gift bag, captioned "Ja w wigilię, kiedy żaden prezent nie wygląda jak własne mieszkanie" ("Me on Christmas Eve, when no present looks like a flat of my own").
- `dynamic-development-gallery-8.jpg`
  - PL: Ujęcie z drona na osiedle domów w Nowej Woli, napis „Dlaczego warto zamieszkać w Nowej Woli pod Warszawą?”
  - EN: Drone shot of a housing estate in Nowa Wola, captioned "Dlaczego warto zamieszkać w Nowej Woli pod Warszawą?" ("Why live in Nowa Wola near Warsaw?").
- `dynamic-development-gallery-9.jpg`
  - PL: Kadr z filmu Dynamic Development — mężczyzna z kubkiem przy oknie w jasnej kuchni, napis „Poznaj Dynamic Development i zacznij spełniać marzenia JUŻ DZIŚ!”
  - EN: Frame from a Dynamic Development video: a man with a mug by a kitchen window, captioned "Poznaj Dynamic Development i zacznij spełniać marzenia JUŻ DZIŚ!" ("Meet Dynamic Development and start making your dreams happen TODAY").
- `dynamic-development-gallery-10.jpg`
  - PL: Ujęcie z drona na apartamentowiec Dynamic Development, napis „Najlepsze miejsce do życia to…”
  - EN: Drone shot of a Dynamic Development apartment building, captioned "Najlepsze miejsce do życia to…" ("The best place to live is…").

## ed-invest — removal only

| pillar | verdict | current |
|---|---|---|
| 1 #WIDEO | drop | ed-invest-gallery-2-cut.webp (ed-invest-gallery-1-cut.webp stays) |

## engie

| pillar | verdict | current | new | source |
|---|---|---|---|---|
| 0 #STRUKTURA_TREŚCI (LinkedIn) | drop→add | engie-gallery-1-anon-cut.webp | engie-gallery-7.jpg, engie-gallery-8.jpg | engie/644335809…_n.jpg, 684817931…_n.jpg |
| 1 #STRUKTURA_TREŚCI (Facebook) | drop→add | engie-gallery-2-anon-cut.webp | engie-gallery-9.jpg, engie-gallery-10.jpg | engie/1778669032195.jpeg, 723675201…_n.jpg |
| 2 #PERSONALBRANDING | drop | engie-gallery-3-anon-cut.webp | — | — |
| 3 #PERSONALBRANDING | keep | engie-gallery-4.jpg | — | — |
| 4 #SPRZEDAŻ | drop→add | engie-gallery-5-anon-cut.webp, engie-gallery-6-anon-cut.webp | engie-gallery-11.jpg, engie-gallery-12.jpg | engie/sprzedaż 1, sprzedaż 2 |

- `engie-gallery-7.jpg`
  - PL: Kreacja ENGIE z lotu ptaka na rynek Słupska i broszurą „Transformacja energetyczna Słupska”, hasło „Transformacja energetyczna zaczyna się LOKALNIE!”
  - EN: ENGIE creative with an aerial view of Słupsk and a "Transformacja energetyczna Słupska" brochure, headlined "Transformacja energetyczna zaczyna się LOKALNIE!" ("The energy transition starts LOCALLY").
- `engie-gallery-8.jpg`
  - PL: Kreacja ENGIE z tenisistą na korcie ziemnym, hasło „Energia odnawialna na… KORCIE?” i informacja „ENGIE oficjalnym partnerem Roland-Garros”
  - EN: ENGIE creative showing a tennis player on clay, headlined "Energia odnawialna na… KORCIE?" ("Renewable energy on… the COURT?") over "ENGIE oficjalnym partnerem Roland-Garros" ("ENGIE is an official Roland-Garros partner").
- `engie-gallery-9.jpg`
  - PL: Kreacja ENGIE na Światowy Dzień Facility Management — pracownik w kamizelce odblaskowej ze świetlnym mieczem, hasło „Niech MOC będzie z Wami!”
  - EN: ENGIE creative for World Facility Management Day: a worker in a hi-vis vest holding a lightsaber, headlined "Niech MOC będzie z Wami!" ("May the FORCE be with you").
- `engie-gallery-10.jpg`
  - PL: Kreacja ENGIE z ramieniem po pobraniu krwi i odznaczeniami honorowego dawcy, hasło „Ludzie ENGIE po godzinach — honorowi dawcy krwi wśród pracowników ENGIE”
  - EN: ENGIE creative showing an arm after a blood donation beside donor medals, headlined "Ludzie ENGIE po godzinach" ("ENGIE people after hours") over "honorowi dawcy krwi wśród pracowników ENGIE" ("blood donors among ENGIE staff").
- `engie-gallery-11.jpg`
  - PL: Kreacja ENGIE z magazynem energii o zmierzchu, hasło „Jeden z największych magazynów energii w Polsce” i podpis „ENGIE finalizuje umowę z R.Power”
  - EN: ENGIE creative showing a battery storage site at dusk, headlined "Jeden z największych magazynów energii w Polsce" ("One of the largest energy storage sites in Poland") over "ENGIE finalizuje umowę z R.Power" ("ENGIE closes a deal with R.Power").
- `engie-gallery-12.jpg`
  - PL: Kreacja ENGIE na tle farmy fotowoltaicznej z informacją o współpracy z BAT i Volta przy dostawach zielonej energii w ramach kontraktu cPPA
  - EN: ENGIE creative over a solar farm announcing green-energy supply with BAT and Volta under a "kontrakt cPPA" ("cPPA contract").

## entelo

| pillar | verdict | current | new | source |
|---|---|---|---|---|
| 2 #NACZASIE | drop→add, crop | entelo-gallery-4-cut.webp (drop), entelo-gallery-6-cut.webp (drop), entelo-gallery-5-cut.webp (crop) | entelo-gallery-10.jpg, entelo-gallery-11.jpg | entelo/497845600…_n.jpg, 505303906…_n.jpg |
| 3 #CONTENT_EDUKACYJNY | drop→add | entelo-gallery-7-cut.webp, entelo-gallery-8-cut.webp | entelo-gallery-12.jpg, entelo-gallery-13.jpg | entelo/495154339…_n.jpg, 496811563…_n.jpg |
| 0, 1, 4 | keep | entelo-gallery-2/3/9-cut.webp | — | — |

- `entelo-gallery-10.jpg`
  - PL: Kreacja Entelo z czerwonym krzesłem obrotowym i hasłem „Euro wizja naszych krzeseł”
  - EN: Entelo creative showing a red swivel chair, headlined "Euro wizja naszych krzeseł" ("The Euro vision of our chairs").
- `entelo-gallery-11.jpg`
  - PL: Kreacja Entelo z krzesłem w piłki nożne i hasłem „Gorące krzesło w polskiej piłce”
  - EN: Entelo creative showing a chair upholstered in footballs, headlined "Gorące krzesło w polskiej piłce" ("The hot seat in Polish football").
- `entelo-gallery-12.jpg`
  - PL: Zadanie „Znajdź różnicę” Entelo — siatka ponumerowanych zielonych krzeseł szkolnych
  - EN: Entelo spot-the-difference puzzle headlined "Znajdź różnicę" ("Find the difference"), a grid of numbered green school chairs.
- `entelo-gallery-13.jpg`
  - PL: Kreacja Entelo z krzesłem dziecięcym w pudełku jak zabawka, hasło „Dobre krzesło — wspieramy zdrowie dzieci”
  - EN: Entelo creative showing a child's chair boxed like a toy, headlined "Dobre krzesło" ("A good chair") with "wspieramy zdrowie dzieci" ("we support children's health").
- `entelo-gallery-5-cut.webp` — crop only, id unchanged; alt already describes the creative and stays.

## fm-logistics

| pillar | verdict | current | new | source |
|---|---|---|---|---|
| 1 #GREENSUPPLYCHAIN | crop | fm-logistics-greensupply-1-cut.webp | — | cut the LinkedIn post frame |
| 2 #CROSSDOCK | crop ×2 | fm-logistics-gallery-3.jpg, fm-logistics-crossdock-2.png | — | cut the post frame |
| 3 #EMPLOYERBRANDING | drop→add | fm-logistics-employerbranding-1.jpg | fm-logistics-employerbranding-2.jpg | **Pexels, pending approval** (task 1.3) |
| 4 #KAMPANIE | keep | fm-logistics-gallery-7.jpg | — | uncut, per the sheet |
| 0 #LIDER_LOGISTYKI | out of scope | fm-logistics-lider-1.jpg | — | stock; the doc replaced it with a stock link, handled in the cover pass |

New alt for the two cropped screenshots, whose current alt says "Zrzut posta":

- `fm-logistics-greensupply-1-cut.webp`
  - PL: Kreacja FM Logistic Central Europe o ekspansji na trasie Polska–Czechy
  - EN: FM Logistic Central Europe creative about its expansion on the Poland–Czechia route.
- `fm-logistics-crossdock-2.png`
  - PL: Kreacja FM Logistic Central Europe o logistyce farmaceutycznej
  - EN: FM Logistic Central Europe creative about pharmaceutical logistics.
- `fm-logistics-gallery-3.jpg` — alt already describes the creative and stays.

The stock replacement, approved 2026-08-21 (see `provenance.md`):

- `fm-logistics-employerbranding-2.jpg`
  - PL: Mężczyzna w ciemnym garniturze przy oknie biurowca, poprawia mankiet koszuli
  - EN: A man in a dark suit standing by an office window, adjusting his shirt cuff.

## foodsaver

| pillar | verdict | current | new | source |
|---|---|---|---|---|
| 0 #EKSPERCKOŚĆ | drop→add | foodsaver-gallery-1.jpg | foodsaver-gallery-4/5/6.jpg | foodsaver/651894644…, 683098284…, 684551676…_n.jpg |
| 1 #LIDERNARYNKU | drop→add | foodsaver-gallery-2.jpg | foodsaver-gallery-7.jpg | foodsaver/763894969…_n.jpg |
| 2 #ZAANGAŻOWANIE | drop→add | foodsaver-gallery-3.jpg | foodsaver-gallery-8.jpg, foodsaver-gallery-9.jpg | foodsaver/494541972…, 606030222…_n.jpg |

- `foodsaver-gallery-4.jpg`
  - PL: Kreacja FoodSaver z kolbą ekspresu pełną fusów, hasło „Sposób na fusy po kawie” i podpis „Zrób naturalny peeling”
  - EN: FoodSaver creative showing a portafilter full of coffee grounds, headlined "Sposób na fusy po kawie" ("What to do with used coffee grounds") over "Zrób naturalny peeling" ("Make a natural scrub").
- `foodsaver-gallery-5.jpg`
  - PL: Kreacja FoodSaver z pęczkiem pietruszki, hasło „Nie wyrzucaj, zrób… GLOW UP PIETRUSZKI”
  - EN: FoodSaver creative showing a bunch of parsley, headlined "Nie wyrzucaj, zrób…" ("Don't throw it out, make…") over "GLOW UP PIETRUSZKI" ("a parsley glow-up").
- `foodsaver-gallery-6.jpg`
  - PL: Kreacja FoodSaver z placuszkami z łodyg brokuła, hasło „Łodygi brokuła? Zrób z nich placki”
  - EN: FoodSaver creative showing broccoli-stalk fritters, headlined "Łodygi brokuła?" ("Broccoli stalks?") over "Zrób z nich placki" ("Turn them into fritters").
- `foodsaver-gallery-7.jpg`
  - PL: Kreacja FoodSaver z zapakowanymi próżniowo owocami w zamrażarce, hasło „Przedłużamy termin ważności sezonu na letnie smaki”
  - EN: FoodSaver creative showing vacuum-sealed fruit in a freezer, headlined "Przedłużamy termin ważności sezonu na letnie smaki" ("Extending the shelf life of summer flavours").
- `foodsaver-gallery-8.jpg`
  - PL: Kreacja FoodSaver „Eurowizyjne bingo” — plansza bingo z eurowizyjnymi hasłami
  - EN: FoodSaver "Eurowizyjne bingo" ("Eurovision bingo") card filled with Eurovision clichés.
- `foodsaver-gallery-9.jpg`
  - PL: Kreacja FoodSaver z mięsem zapakowanym próżniowo i po przyprawieniu, hasło „Stranger Foods”
  - EN: FoodSaver creative showing meat vacuum-sealed and then seasoned, headlined "Stranger Foods".

## kbp — removals only

| pillar | verdict | current |
|---|---|---|
| 0 #PROMOCJAWYDARZENIA | drop | kbp-gallery-1.jpg, kbp-gallery-2.jpg |

The study is left with no creatives at all — its only pillar goes text-only.

## kohersen

| pillar | verdict | current | new | source |
|---|---|---|---|---|
| 0 #EKSPERCKOŚĆ | drop→add | kohersen-gallery-1.jpg, kohersen-gallery-2.jpg | kohersen-gallery-9.jpg, kohersen-gallery-10.jpg | kohersen/494760074… (1).jpg, 633150794…_n.jpg |
| 1 #ZAANGAŻOWANIE | drop→add | kohersen-gallery-3.jpg | kohersen-gallery-11.jpg, kohersen-gallery-12.jpg | kohersen/Zrzut…16.28.26.png, Zrzut…16.29.20.png |
| 2 #SPRZEDAŻ | drop→add | kohersen-gallery-4.jpg | kohersen-gallery-13.jpg, kohersen-gallery-14.jpg | kohersen/560419038…_n.jpg, 694463165…_n.jpg |
| 3, 4 | keep | kohersen-gallery-5/6/7/8.jpg | — | — |

- `kohersen-gallery-9.jpg`
  - PL: Kreacja Kohersen z garnkiem na scenie koncertowej, hasło „Moje imię gaaa…” i opis garnka DIAMOND Black Cube 28 cm z funkcją gotowania na parze
  - EN: Kohersen creative showing a pot on a concert stage, headlined "Moje imię gaaa…" ("My name is gaaa…"), describing the DIAMOND Black Cube 28 cm pot with a steaming function.
- `kohersen-gallery-10.jpg`
  - PL: Kreacja Kohersen z telefonem, na ekranie profil w stylu aplikacji randkowej „Matt, 26 lat” prezentujący płytę indukcyjną marki
  - EN: Kohersen creative showing a phone with a dating-app style profile, "Matt, 26 lat" ("Matt, 26"), presenting the brand's induction hob.
- `kohersen-gallery-11.jpg`
  - PL: Kreacja Kohersen z mężczyzną trzymającym paragon i drożdżówkę, napis „POV: Kupujesz drożdżówkę z poziomkami w 2026 roku”
  - EN: Kohersen creative showing a man with a receipt and a pastry, captioned "POV: Kupujesz drożdżówkę z poziomkami w 2026 roku" ("POV: buying a wild-strawberry bun in 2026").
- `kohersen-gallery-12.jpg`
  - PL: Kreacja Kohersen z rozczarowaną kobietą, napis „Kiedy miały być wspólne walentynki, ale on zamówił pizzę hawajską”
  - EN: Kohersen creative showing a dismayed woman, captioned "Kiedy miały być wspólne walentynki, ale on zamówił pizzę hawajską" ("When it was meant to be Valentine's together and he ordered Hawaiian pizza").
- `kohersen-gallery-13.jpg`
  - PL: Kreacja sprzedażowa Kohersen z jajecznicą na patelni i hasłem „Twoja kuchnia woła o nową gwiazdę!”, w rogu rabat -30%
  - EN: Kohersen sales creative showing fried eggs in a pan, headlined "Twoja kuchnia woła o nową gwiazdę!" ("Your kitchen is calling for a new star") with a -30% flash.
- `kohersen-gallery-14.jpg`
  - PL: Kreacja konkursowa Kohersen z grillem elektrycznym i hasłem „Wygraj grill elektryczny — konkurs nadal trwa”
  - EN: Kohersen contest creative showing an electric grill, headlined "Wygraj grill elektryczny" ("Win an electric grill") with "konkurs nadal trwa" ("the contest is still running").

## kontigo — removal only

| pillar | verdict | current |
|---|---|---|
| 2 #LIVE | drop | kontigo-gallery-4.jpg |

## las-vegans — removals only

| pillar | verdict | current | note |
|---|---|---|---|
| 0 #WEBINARY | drop | las-vegans-gallery-1.jpg, las-vegans-gallery-2.jpg | illegible landscape screenshots |
| 1 #INFLUENCERZY | keep + drop | las-vegans-gallery-3-cut.webp (keep), las-vegans-gallery-4.jpg (drop) | |
| 2 #SPOLECZNOSC_WEGE | keep + drop | las-vegans-gallery-5.jpg (keep), las-vegans-gallery-6.jpg (drop) | |
| 3 #PR_W_MEDIACH | keep | las-vegans-gallery-7.jpg, las-vegans-gallery-8.jpg | left as they are |
| 4 #WYNIKI_I_SUKCES | drop | las-vegans-gallery-9.jpg, las-vegans-gallery-10.jpg | illegible |

Both press clippings stay exactly as they are: the owner cancelled the re-cut on 2026-08-21 ("las-vegans doesn't need recut"), so the boxes
measured for them were reverted before anything was written.

## laurastar

| pillar | verdict | current | new | source |
|---|---|---|---|---|
| 0 #EKSPERCKOŚĆ | drop→add | laurastar-gallery-1-cut.webp | laurastar-gallery-5/6/7.jpg | laurastar/492810376…, 653708465…_n.jpg, Zrzut…15.24.01.png |
| 1 #SPRZEDAŻ | drop→add | laurastar-gallery-2.jpg | laurastar-gallery-8/9/10.jpg | laurastar/547098270…, 686135776… (1).jpg, 773450217…_n.jpg |
| 2 #ZAANGAŻOWANIE | drop→add | laurastar-gallery-4-cut.webp | laurastar-gallery-11.jpg | laurastar/748096758… (1).jpg |

- `laurastar-gallery-5.jpg`
  - PL: Kreacja Laurastar z prasowaniem fioletowej koszuli w kłębach pary, hasło „As w rękawie”
  - EN: Laurastar creative showing a violet shirt being steamed, headlined "As w rękawie" ("An ace up the sleeve").
- `laurastar-gallery-6.jpg`
  - PL: Kreacja Laurastar z żelazkiem parowym nad tkaniną, hasło „Promocyjna odwilż”
  - EN: Laurastar creative showing a steam iron over fabric, headlined "Promocyjna odwilż" ("A promotional thaw").
- `laurastar-gallery-7.jpg` — screenshot, cropped
  - PL: Kadr z filmu Laurastar — mężczyzna przy generatorze pary odpowiada na komentarz o ciśnieniu 3,5 bara
  - EN: Frame from a Laurastar video: a man beside a steam generator answering a comment about 3.5 bar pressure.
- `laurastar-gallery-8.jpg`
  - PL: Kreacja Laurastar ze złotym generatorem pary na tle ceglanej ściany, hasło „Prasuje jak złoto”
  - EN: Laurastar creative showing a gold steam generator against a brick wall, headlined "Prasuje jak złoto" ("Irons like gold").
- `laurastar-gallery-9.jpg`
  - PL: Kreacja Laurastar z czerwonym generatorem pary obok czerwonych szpilek, hasło „Asystentka, na której możesz polegać”
  - EN: Laurastar creative showing a red steam generator beside red heels, headlined "Asystentka, na której możesz polegać" ("An assistant you can rely on").
- `laurastar-gallery-10.jpg`
  - PL: Kreacja Laurastar z generatorem pary pod rozgwieżdżonym niebem, hasło „Nie czekaj na spadającą gwiazdę”
  - EN: Laurastar creative showing a steam generator under a starry sky, headlined "Nie czekaj na spadającą gwiazdę" ("Don't wait for a shooting star").
- `laurastar-gallery-11.jpg`
  - PL: Kreacja Laurastar z dwiema koszulkami piłkarskimi na desce do prasowania, hasło „Którą koszulkę byś wyprasował?”
  - EN: Laurastar creative showing two football shirts on an ironing board, headlined "Którą koszulkę byś wyprasował?" ("Which shirt would you iron?").

## mazurska-manufaktura-alkoholi — removal only

| pillar | verdict | current |
|---|---|---|
| 2 #ZASIEG_MEDIALNY | drop | mazurska-manufaktura-alkoholi-gallery-5.jpg (the Pudelek clipping); gallery-6 stays |

The doc's "grafika główna do zmiany" is the cover, no source supplied — out of
scope here.

## mercator

| pillar | verdict | current | new | source |
|---|---|---|---|---|
| 0 #WIDEOPRODUKTOWE | drop→add | mercator-gallery-1.jpg, mercator-gallery-2.jpg | mercator-gallery-9.jpg, mercator-gallery-10.jpg | mercator/735150241…, 735734788…_n.jpg |
| 1 #GRAFIKI | drop→add | mercator-gallery-3-cut.webp | mercator-gallery-11.jpg, mercator-gallery-12.jpg | mercator/741606684…, 747903077…_n.jpg |
| 2 #BRANŻEIZASTOSOWANIA | drop→add | mercator-gallery-4-cut.webp, mercator-gallery-5-cut.webp | mercator-gallery-13/14/15.jpg | mercator/752648878…, 768347799…, 780501887…_n.jpg |
| 3 #EVENTYIŻYCIEFIRMY | drop→add | mercator-gallery-6-cut.webp, mercator-gallery-7-cut.webp | mercator-gallery-16.jpg | mercator/768258396…_n.jpg |
| 4 #MODERACJA | drop | mercator-gallery-8.jpg | — | — |

Every Mercator creative carries the medical-device disclaimer under the
artwork. It is part of the image and is never cropped away.

- `mercator-gallery-9.jpg`
  - PL: Kreacja Mercator z kosmetolożką w różowych rękawicach nitrylex pink, hasło „Jakie zabiegi kosmetyczne wykonywać latem?”, poniżej wymagany disclaimer o wyrobie medycznym
  - EN: Mercator creative showing a beautician in pink nitrylex gloves, headlined "Jakie zabiegi kosmetyczne wykonywać latem?" ("Which beauty treatments to have in summer?"), above the required medical-device disclaimer.
- `mercator-gallery-10.jpg`
  - PL: Kreacja Mercator porównująca emoji rękawicy z kolorowymi rękawicami marki, hasło „Emoji rękawic? Fajne… ale przydałby się mały update”, poniżej wymagany disclaimer o wyrobie medycznym
  - EN: Mercator creative comparing the glove emoji with the brand's coloured gloves, headlined "Emoji rękawic? Fajne… ale przydałby się mały update" ("Glove emoji? Nice… but they could use an update"), above the required medical-device disclaimer.
- `mercator-gallery-11.jpg`
  - PL: Kreacja Mercator z truskawkami i lodami nakładanymi w niebieskich rękawicach nitrylex classic, hasło „Smak lata w dobrych rękach”, poniżej wymagany disclaimer o wyrobie medycznym
  - EN: Mercator creative showing strawberries and ice cream scooped in blue nitrylex classic gloves, headlined "Smak lata w dobrych rękach" ("The taste of summer in good hands"), above the required medical-device disclaimer.
- `mercator-gallery-12.jpg`
  - PL: Kreacja Mercator z dwiema rękawicami układającymi serce, hasło „My od zawsze wiedzieliśmy, że ten zestaw idealnie do siebie pasuje”
  - EN: Mercator creative showing two gloved hands forming a heart, headlined "My od zawsze wiedzieliśmy, że ten zestaw idealnie do siebie pasuje" ("We always knew this pair was a perfect match").
- `mercator-gallery-13.jpg`
  - PL: Kreacja Mercator z kucharzem w czarnych rękawicach nitrylex black w foodtrucku, hasło „Gdybyś miał własnego foodtrucka, to jak byś go nazwał?”, poniżej wymagany disclaimer o wyrobie medycznym
  - EN: Mercator creative showing a cook in black nitrylex gloves at a food truck, headlined "Gdybyś miał własnego foodtrucka, to jak byś go nazwał?" ("If you had your own food truck, what would you call it?"), above the required medical-device disclaimer.
- `mercator-gallery-14.jpg`
  - PL: Kreacja Mercator z mechanikiem w pomarańczowych rękawicach przy rowerze, hasło „Warsztatowe triki, które oszczędzają czas”
  - EN: Mercator creative showing a mechanic in orange gloves working on a bicycle, headlined "Warsztatowe triki, które oszczędzają czas" ("Workshop tricks that save time").
- `mercator-gallery-15.jpg`
  - PL: Kreacja Mercator z dłońmi w niebieskich rękawicach pakującymi kanapkę, hasło „Profesjonalizm od kuchni”, poniżej wymagany disclaimer o wyrobie medycznym
  - EN: Mercator creative showing blue-gloved hands boxing a sandwich, headlined "Profesjonalizm od kuchni" ("Professionalism from the kitchen side"), above the required medical-device disclaimer.
- `mercator-gallery-16.jpg`
  - PL: Kreacja Mercator z przesadzaniem rośliny w zielonej rękawicy i naprawą w niebieskiej, ankieta „Najczęściej używam rękawiczek w: domu / pracy”
  - EN: Mercator creative pairing repotting a plant in a green glove with a repair in a blue one, over the poll "Najczęściej używam rękawiczek w: domu / pracy" ("I use gloves most often at: home / work").

## personal-effect

| pillar | verdict | current | new | source |
|---|---|---|---|---|
| 0 #PERSONALEFFECT | drop→add | personal-effect-gallery-1-cut.webp, -gallery-2-cut.webp | personal-effect-gallery-11.jpg, -gallery-12.jpg | personal effect]/709056679…, 711289389…_n.jpg |
| 1 #EKSPERCKOŚĆ | drop→add | personal-effect-gallery-3.jpg, -gallery-4.jpg | personal-effect-gallery-13.jpg, -gallery-14.jpg | 740462137…, 744184621…_n.jpg |
| 2 #ODŚWIEŻENIEPROFILU | keep | personal-effect-gallery-5/6-cut.webp | — | — |
| 3 #SESJA | drop→add | personal-effect-gallery-7.jpg, -gallery-8.jpg | personal-effect-gallery-15.jpg, -gallery-16.jpg | 749419664…, 752488686…_n.jpg |
| 4 #ROZWÓJ | keep + add | personal-effect-gallery-9/10-cut.webp (keep) | personal-effect-gallery-17.jpg | 771013274…_n.jpg |

- `personal-effect-gallery-11.jpg`
  - PL: Ilustracja Personal Effect — sylwetka dorosłej osoby, w niej dziewczynka z pluszakiem, hasło „Jak dbasz o swoje wewnętrzne dziecko?”
  - EN: Personal Effect illustration: an adult silhouette holding a little girl with a soft toy inside it, headlined "Jak dbasz o swoje wewnętrzne dziecko?" ("How do you look after your inner child?").
- `personal-effect-gallery-12.jpg`
  - PL: Ilustracja Personal Effect — matka i dziecko chowające się za drzwiami, hasło „Dzieci często pokazują emocje zachowaniem”
  - EN: Personal Effect illustration: a mother and a child hiding behind a door, headlined "Dzieci często pokazują emocje zachowaniem" ("Children often show emotion through behaviour").
- `personal-effect-gallery-13.jpg`
  - PL: Ilustracja Personal Effect — kobieta z kubkiem i książką, hasło „Nie wszystko musi być produktywne”
  - EN: Personal Effect illustration: a woman with a mug and a book, headlined "Nie wszystko musi być produktywne" ("Not everything has to be productive").
- `personal-effect-gallery-14.jpg`
  - PL: Ilustracja Personal Effect — postać wspinająca się po linie, hasło „Odpuszczenie nie wiąże się z porażką”
  - EN: Personal Effect illustration: a figure climbing a rope, headlined "Odpuszczenie nie wiąże się z porażką" ("Letting go is not the same as failing").
- `personal-effect-gallery-15.jpg`
  - PL: Ilustracja Personal Effect — kobieta ze łzą patrząca w telefon, hasło „Nie porównuj swojego życia do czyjegoś kadru”
  - EN: Personal Effect illustration: a tearful woman looking at her phone, headlined "Nie porównuj swojego życia do czyjegoś kadru" ("Don't compare your life to someone else's frame").
- `personal-effect-gallery-16.jpg`
  - PL: Ilustracja Personal Effect — rodzic z dzieckiem na fotelu, hasło „Szczęśliwy rodzic nie zapomina o swoich potrzebach”
  - EN: Personal Effect illustration: a parent and child in an armchair, headlined "Szczęśliwy rodzic nie zapomina o swoich potrzebach" ("A happy parent doesn't forget their own needs").
- `personal-effect-gallery-17.jpg`
  - PL: Kreacja Personal Effect z pływakiem w jeziorze o zachodzie słońca, hasło „Największą siłą jest odwaga, żeby spróbować znowu”
  - EN: Personal Effect creative showing a swimmer in a lake at sunset, headlined "Największą siłą jest odwaga, żeby spróbować znowu" ("The greatest strength is the courage to try again").

## power-elements

| pillar | verdict | current | new | source |
|---|---|---|---|---|
| 0 #PREMIERA_MARKI | drop→add | power-elements-gallery-1-cut.webp, -gallery-2-cut.webp | power-elements-gallery-10/11/12.jpg | Power elements/Zrzut…16.19.44.png, Zrzut…16.20.17.png, 687847548…_n.jpg |
| 1 #LIFESTYLE | drop→add | power-elements-gallery-3.jpg, -gallery-4-cut.webp | power-elements-gallery-13.jpg | 708570950…_n.jpg |
| 2 #EDUKACJA | drop→add | power-elements-gallery-5-cut.webp, -gallery-6-cut.webp | power-elements-gallery-14.jpg, -gallery-15.jpg | Zrzut…16.18.18.png, Zrzut…16.18.42.png |
| 3 #COMMUNITY | drop | power-elements-gallery-7-cut.webp | — | — |
| 4 #VIDEO | keep | power-elements-gallery-8/9-cut.webp | — | — |
| cover | repoint | power-elements-cover.jpg | power-elements-cover-2.jpg | supplied by the owner 2026-08-21 |

The cover swap was added on 2026-08-21 after the plan was approved. The old
cover is a product shot in portrait (533×800), which the 1.9:1 listing card
crops hard; the replacement is a green-powder texture, encoded at 814×428 —
the largest the supplied file allows, so it upscales on the card. The displaced
row is detached, not deleted.

- `power-elements-cover-2.jpg`
  - PL: Zbliżenie na zielony proszek ułożony w koncentryczne kręgi
  - EN: A close-up of green powder raked into concentric circles

- `power-elements-gallery-10.jpg`
  - PL: Zapowiedź marki Power Elements — czarna puszka suplementu w ciemności, napis „POWER IS COMING”
  - EN: Power Elements teaser: the black supplement tub in the dark, captioned "POWER IS COMING".
- `power-elements-gallery-11.jpg`
  - PL: Kreacja Power Elements ze wspinaczem na skalnej grani, hasło „Chcesz wspiąć się na wyższy poziom? Wkrótce dowiesz się jak”
  - EN: Power Elements creative showing a climber on a rocky ridge, headlined "Chcesz wspiąć się na wyższy poziom?" ("Want to climb to the next level?") over "Wkrótce dowiesz się jak" ("You'll find out how soon").
- `power-elements-gallery-12.jpg`
  - PL: Kreacja Power Elements z puszką suplementu i shakerem w zielonym proszku, hasło „Power Elements już w sprzedaży — zamów i poczuj różnicę na własnej skórze”
  - EN: Power Elements creative showing the supplement tub and a shaker in green powder, headlined "Power Elements już w sprzedaży" ("Power Elements is on sale") over "zamów i poczuj różnicę na własnej skórze" ("order and feel the difference yourself").
- `power-elements-gallery-13.jpg`
  - PL: Kreacja porównawcza Power Elements — garść tabletek („Jak było kiedyś”) kontra jeden shaker („Jak jest dzisiaj”)
  - EN: Power Elements comparison creative: a scatter of pills ("Jak było kiedyś" — "How it used to be") against a single shaker ("Jak jest dzisiaj" — "How it is today").
- `power-elements-gallery-14.jpg`
  - PL: Kreacja edukacyjna Power Elements zestawiająca „Twoje problemy” (brak energii, słabe włosy, skomplikowana suplementacja, brak koncentracji) z „Nasze rozwiązania” i puszką suplementu
  - EN: Power Elements creative pairing "Twoje problemy" ("Your problems" — low energy, weak hair, complicated supplementation, poor focus) with "Nasze rozwiązania" ("Our solutions") and the supplement tub.
- `power-elements-gallery-15.jpg`
  - PL: Kreacja Power Elements z shakerem i zakrętką, hasło „Co znajduje się w środku?”
  - EN: Power Elements creative showing a shaker and its cap, headlined "Co znajduje się w środku?" ("What's inside?").

## pracuj-pl — refilled by the owner's ruling

Ania's 08-19 pass stripped every creative off this study ("not Social Lama's
work"); Emilia had supplied five on 08-17. The owner ruled on 2026-08-21: use
all of them except `blur 1`, spread across the pillars, cover untouched. That
settles the conflict this change had recorded as open.

| pillar | verdict | current | new | source |
|---|---|---|---|---|
| 0 (no tag) *Społeczność zbudowana od zera* | add | (empty) | pracuj-pl-gallery-1.jpg | Pracuj/FUNNY 2 |
| 1 FILTR AR | — | (empty) | — | nothing in the folder shows the AR filter |
| 2 #CONTENT *Content edukacyjny* | add ×2 | (empty) | pracuj-pl-gallery-2.jpg, pracuj-pl-gallery-3.jpg | Pracuj/EDU 2, Pracuj/blur 2 |
| 3 #CONTENT *Content humorystyczny* | add ×2 | (empty) | pracuj-pl-gallery-4.jpg, pracuj-pl-gallery-5.jpg | Pracuj/FUNNY 1, Pracuj/FUNNY 3 |
| 4 (no tag) *Aktywna moderacja* | — | (empty) | — | no moderation capture supplied |
| 5 #INFLUENCER MARKETING | — | (empty) | — | no creator content supplied |
| cover | keep | pracuj-pl-cover.jpg | — | left as it is, per the owner |

`blur 1` is excluded by name; it is the same frame as `blur 2` with a weaker
blur on the faces behind the mascot. `blur 2` carries 95 px of white either
side of the frame, cropped away before encoding.

The one interpretive call: **FUNNY 2 on pillar 0**. It is a humour creative by
origin, but it is also the only one where the pracuj.pl mascot appears in brand
kit, and pillar 0 is about building the following from zero. Putting all three
FUNNY files in pillar 3 would leave four of six pillars empty and cluster
everything in one strip — "nicely spread" was the instruction.

- `pracuj-pl-gallery-1.jpg`
  - PL: Kreacja Pracuj.pl z maskotką bobra w bluzie marki na tle pustej sali konferencyjnej, napis „Kiedy wszyscy na ciebie krzyczą, bo zjadłeś biurka, a ty po prostu jesteś wychillowanym Bobrem, co lubi wrzucić coś na ząb”
  - EN: Pracuj.pl creative showing the beaver mascot in a branded hoodie in an empty meeting room, captioned "Kiedy wszyscy na ciebie krzyczą, bo zjadłeś biurka, a ty po prostu jesteś wychillowanym Bobrem, co lubi wrzucić coś na ząb" ("When everyone shouts at you for eating the desks, and you are just a chilled-out beaver who likes a snack").
- `pracuj-pl-gallery-2.jpg`
  - PL: Kadr z filmu Pracuj.pl — maskotka surykatki w biurze coworkingowym, napisy „Słowa kluczowe” i „Jak je znaleźć w ogłoszeniu?”
  - EN: Frame from a Pracuj.pl video: the meerkat mascot in a coworking office, captioned "Słowa kluczowe" ("Keywords") and "Jak je znaleźć w ogłoszeniu?" ("How to find them in a job ad").
- `pracuj-pl-gallery-3.jpg`
  - PL: Kadr z filmu Pracuj.pl — maskotka surykatki przed rozmytymi uczestniczkami nagrania, napisy „AI zastąpiło rekruterów?” i „Preselekcja AI w rekrutacji”
  - EN: Frame from a Pracuj.pl video: the meerkat mascot in front of blurred participants, captioned "AI zastąpiło rekruterów?" ("Has AI replaced recruiters?") and "Preselekcja AI w rekrutacji" ("AI pre-screening in recruitment").
- `pracuj-pl-gallery-4.jpg`
  - PL: Kadr z filmu Pracuj.pl — osoba siedząca twarzą do kąta biura, napisy „Posadziliśmy go w kącie, bo źle się zachowywał w pracy” i „zgadnijcie co zrobił…”
  - EN: Frame from a Pracuj.pl video: a person sitting facing the corner of an office, captioned "Posadziliśmy go w kącie, bo źle się zachowywał w pracy" ("We put him in the corner for behaving badly at work") and "zgadnijcie co zrobił…" ("guess what he did").
- `pracuj-pl-gallery-5.jpg`
  - PL: Kadr z filmu Pracuj.pl — widok przez zęby widelca na pracownika w kamizelce odblaskowej, napis „Gdy kolega w pracy mnie denerwuje to patrzę na niego przez widelec i udaje, że jest za kratami”
  - EN: Frame from a Pracuj.pl video: a colleague in a hi-vis vest seen through the tines of a fork, captioned "Gdy kolega w pracy mnie denerwuje to patrzę na niego przez widelec i udaje, że jest za kratami" ("When a workmate annoys me I look at him through a fork and pretend he is behind bars").

## stadler-form

| pillar | verdict | current | new | source |
|---|---|---|---|---|
| 0 #ROZPOZNAWALNOŚĆ | drop→add | stadler-form-gallery-1.jpg, -gallery-2.jpg | stadler-form-gallery-11.jpg, -gallery-12.jpg | stadler form/Zrzut…15.26.51.png, Zrzut…15.27.44.png |
| 1 #MODERACJA | drop | stadler-form-gallery-3.jpg, -gallery-4.jpg | — | — |
| 2 #EKSPERCKOŚĆ | drop→add | stadler-form-gallery-5.jpg, -gallery-6.jpg | stadler-form-gallery-13.jpg | Zrzut…15.31.14.png |
| 3 #WIDEO | drop→add | stadler-form-gallery-7.jpg, -gallery-8.jpg | stadler-form-gallery-14.jpg, -gallery-15.jpg | Zrzut…15.28.16.png, Zrzut…15.30.43.png |
| 4 #SESJEZDJĘCIOWE | keep | stadler-form-gallery-9.jpg, -gallery-10.jpg | — | — |

gallery-5/6/7 carry no faces; "reszta do zmiany" is read literally, as the
sheet flags.

- `stadler-form-gallery-11.jpg`
  - PL: Kadr z rolki Stadler Form — nawilżacz na tarasowym stole obok szklanki lemoniady, napis „A jak wygląda Twój, idealny letni wieczór?”
  - EN: Frame from a Stadler Form reel: a humidifier on a terrace table beside a glass of lemonade, captioned "A jak wygląda Twój, idealny letni wieczór?" ("What does your perfect summer evening look like?").
- `stadler-form-gallery-12.jpg`
  - PL: Kadr z rolki Stadler Form — oczyszczacz w salonie, w tle kobieta z psem na kanapie, napis „A Ty, jak spędzasz czas po pracy?”
  - EN: Frame from a Stadler Form reel: an air purifier in a living room with a woman and a dog on the sofa behind it, captioned "A Ty, jak spędzasz czas po pracy?" ("And how do you spend your time after work?").
- `stadler-form-gallery-13.jpg`
  - PL: Kadr z rolki Stadler Form — dłoń przy nawilżaczu, napisy „Jak przetrwać sezon grzewczy?” i „Z nawilżaczem Stadler Form”
  - EN: Frame from a Stadler Form reel: a hand at the humidifier, captioned "Jak przetrwać sezon grzewczy?" ("How to survive the heating season?") and "Z nawilżaczem Stadler Form" ("With a Stadler Form humidifier").
- `stadler-form-gallery-14.jpg`
  - PL: Kadr z rolki Stadler Form — ćwiczenie jogi na macie obok śpiącego psa, napis „A Ty, praktykujesz jogę?”
  - EN: Frame from a Stadler Form reel: a yoga stretch on a mat beside a sleeping dog, captioned "A Ty, praktykujesz jogę?" ("Do you practise yoga?").
- `stadler-form-gallery-15.jpg`
  - PL: Kadr z rolki Stadler Form — nawilżacz z zieloną poświatą mgły, napis „POV: zorze masz każdego dnia”
  - EN: Frame from a Stadler Form reel: a humidifier glowing green through its mist, captioned "POV: zorze masz każdego dnia" ("POV: you get the northern lights every day").

## vobis

| pillar | verdict | current | new | source |
|---|---|---|---|---|
| 0 #RTM | drop→add | vobis-gallery-1.jpg, vobis-gallery-2.jpg | vobis-gallery-5/6/7.jpg | vobis/505158865…, 532442295…, 641115465…_n.jpg |
| 1 #NOWE_FORMATY_POSTÓW | drop→add | vobis-gallery-3.jpg | vobis-gallery-8/9/10.jpg | vobis/645442464…, 740686631…, 765769977…_n.jpg |
| 2 #MODERACJA | drop | vobis-gallery-4-cut.webp | — | — |

- `vobis-gallery-5.jpg`
  - PL: Kreacja Vobis ze słuchawkami nausznymi bez lewej muszli, hasło „Bez lewego to nie to samo”
  - EN: Vobis creative showing over-ear headphones missing the left cup, headlined "Bez lewego to nie to samo" ("Without the left one it's just not the same").
- `vobis-gallery-6.jpg`
  - PL: Kreacja Vobis z psem przed wentylatorem, hasło „Najlepszy przyjaciel człowieka”
  - EN: Vobis creative showing a dog in front of a fan, headlined "Najlepszy przyjaciel człowieka" ("Man's best friend").
- `vobis-gallery-7.jpg`
  - PL: Kreacja Vobis z pluszową małpą trzymającą smartfona, hasło „W dobrych rękach”
  - EN: Vobis creative showing a plush monkey holding a smartphone, headlined "W dobrych rękach" ("In good hands").
- `vobis-gallery-8.jpg`
  - PL: Kreacja Vobis z lokalizatorami AirTag w etui, hasło „Lokalizacja: [nieznana]”
  - EN: Vobis creative showing AirTag trackers in cases, headlined "Lokalizacja: [nieznana]" ("Location: [unknown]").
- `vobis-gallery-9.jpg`
  - PL: Kreacja Vobis zestawiająca klawiaturę z podświetleniem RGB i klasyczną, hasło „Klawiatura RGB czy klasyczna?”
  - EN: Vobis creative pairing an RGB-backlit keyboard with a plain one, headlined "Klawiatura RGB czy klasyczna?" ("RGB keyboard or classic?").
- `vobis-gallery-10.jpg`
  - PL: Biała kreacja Vobis z samym logo i notatką „Miał być post, ale grafik na wakacjach”
  - EN: Plain white Vobis creative with the logo and the line "Miał być post, ale grafik na wakacjach" ("There was going to be a post, but the designer is on holiday").

## volvo

| pillar | verdict | current | new | source |
|---|---|---|---|---|
| 0 #STRUKTURA TREŚCI | drop→add ×2 | volvo-vcw-post-anon-cut.webp | volvo-gallery-1.jpg, volvo-gallery-2.jpg | volvo/509971582…_n.jpg, 511140235…_n.jpg |
| 1 #STRUKTURA TREŚCI | drop→add | volvo-vcw-goracy-anon-cut.webp | volvo-gallery-3.jpg | volvo/Zrzut…14.46.32.png |
| 2 (no tag) | keep | volvo-event-noc.jpg, volvo-event-ex30.jpg | — | — |
| 3 KONKURS | drop→add | volvo-konkurs-warsztat.jpg | volvo-gallery-4/5/6.jpg | volvo/konkurs 1, konkurs 2, konkurs 3 |

- `volvo-gallery-1.jpg`
  - PL: Kreacja Volvo Car Warszawa z przeszklonym Domem Volvo, hasło „Midsommar w Domu Volvo: dni otwarte 25–27.06” i zapowiedź premiery Volvo XC60
  - EN: Volvo Car Warszawa creative showing the glass Dom Volvo showroom, headlined "Midsommar w Domu Volvo: dni otwarte 25–27.06" ("Midsommar at Dom Volvo: open days 25–27 June") with the Volvo XC60 launch.
- `volvo-gallery-2.jpg`
  - PL: Kreacja Volvo z dwiema markowymi butelkami na leśnym poszyciu, hasło „Styl i równowaga”
  - EN: Volvo creative showing two branded bottles on forest floor, headlined "Styl i równowaga" ("Style and balance").
- `volvo-gallery-3.jpg`
  - PL: Kreacja Volvo z kobietą z rozwianymi włosami nad morzem, hasło „Gorący okres? Weź to na chłodno!”
  - EN: Volvo creative showing a woman with wind-blown hair by the sea, headlined "Gorący okres?" ("A hot spell?") over "Weź to na chłodno!" ("Take it cool").
- `volvo-gallery-4.jpg`
  - PL: Kreacja konkursowa Volvo z dziećmi rysującymi przy stole, hasło „Volvo oczami dziecka” i zaproszenie na wystawę prac w Domu Volvo 25–27.06
  - EN: Volvo contest creative showing children drawing at a table, headlined "Volvo oczami dziecka" ("Volvo through a child's eyes"), inviting visitors to the exhibition at Dom Volvo on 25–27 June.
- `volvo-gallery-5.jpg`
  - PL: Kreacja konkursowa Volvo z dzieckiem w elektrycznym autku Volvo, hasło „KONKURS — zostań projektantem Volvo i narysuj Volvo marzeń!”
  - EN: Volvo contest creative showing a child in a ride-on Volvo, headlined "KONKURS" ("Contest") over "zostań projektantem Volvo i narysuj Volvo marzeń!" ("become a Volvo designer and draw your dream Volvo").
- `volvo-gallery-6.jpg`
  - PL: Wystawa prac konkursowych „Volvo oczami dziecka” — rysunki rozwieszone na brzozowych stelażach w Domu Volvo
  - EN: The "Volvo oczami dziecka" exhibition: children's drawings pegged to birch frames at Dom Volvo.

---

## Encoding

Every added file goes through `scripts/case-studies/encode_pillar.py`: longest
side ≤ 1350 px, JPEG q82, sRGB, EXIF stripped. Crop boxes for the screenshots
are recorded in `crops.tsv` beside this file — one row per source file, empty
where the screenshot needed none.

Four supplied files are 576×720 (`breville/594451694`, `kohersen/494760074`,
`kohersen/560419038`, `power elements/708570950`). They render at 240 px in
`.shot`, so the resolution is still ample; they are not upscaled.

## Applied state

Applied 2026-08-21 by `lib/payload/apply-pillar-refresh.ts`, dev first and then
production, both re-run to `0 pending · 74 already done · 0 stale · 0 missing`.

| | dev | production |
|---|---|---|
| media rows created | 89 | 89 |
| pillars rewritten (×2 locales) | 66 | 66 |
| bytes replaced in place | 7 | 7 |
| cover repointed | 1 | 1 |
| stale rows | 0 | 0 |

Production's pillars matched the plan's `from` sets exactly — the report run
found no divergence from dev, which is not what the covers pass found in
August. `finish()` revalidated 24 tags and purged the CDN in the same run.

The detached rows are still there, unreferenced: 91 creatives plus the old
power-elements cover. Deleting them is a separate decision and a separate
change; `audit-case-study-orphans.ts` lists them.

### Covers, and the one that got away

`power-elements` and the FM #EMPLOYERBRANDING stock landed as planned. The
`kbp` cover did not, and the way it failed is worth keeping:

The pick was Pexels 2774556, encoded and applied to dev as `kbp-cover-3.jpg`.
On production that filename was **already taken by the study's current cover** —
the masked photograph — because the pre-`media-ops` covers run hit Payload's
`getSafeFileName` bump and landed ~27 rows one number higher than planned
(`apply-cover-refresh.ts` still carries the `stored:` mapping). So
`repointRelation` read the field, compared it against the target, found them
equal, and reported **`already-done`**: zero pending, zero stale, nothing
written, the wrong image still live. No guard can catch that — "the field
already holds the target filename" is exactly what success looks like.

The row was dropped from the plan, and kbp / entelo / dolina-charlotty were
handed to the owner as encoded files under numbers checked free on **both**
databases (`kbp-cover-4`, `entelo-cover-6`, `dolina-charlotty-cover-2`).
Anything that replaces a cover from now on must list `<slug>-cover*` on dev and
prod before choosing a name.

**Dev has one artefact production does not**: the 89 uploaded files sit in
`media/` locally (no Blob token there). `begin()` refuses a production run while
that directory holds anything, so it was moved aside for the prod run and moved
back afterwards.
