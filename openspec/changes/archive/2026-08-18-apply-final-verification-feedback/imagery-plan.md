# PLAN obrazów — apply-final-verification-feedback

Zatwierdzona lista per-obraz (spec `case-studies`). Werdykty: audyt Anny (A), dyspozycje Emilii (E), decyzje Przemka (P; 11 spornych rozstrzygnięte 2026-08-18 na czacie). Stan wejściowy: dump dev DB 2026-08-18, 349 obrazów w zakresie, zero rozjazdu PL/EN.

Wykonawca: `lib/payload/apply-final-verification-imagery.ts` (report-first, idempotentny, per-locale po id, detach-nigdy-delete). Nazwy plików, nie id — id są per-baza. Czytany wstecz ten plan JEST instrukcją rollbacku.

Zastosowany na dev 2026-08-18: 108 edytów locale, 46 uploadów, 55 odpięć, 0 usunięć; run 2 = zero zmian.

| werdykt | ile |
|---|---|
| zostaje | 51 |
| podmień | 26 |
| edytuj (anonimizacja) | 19 |
| usuń (odepnij) | 11 |
| przeeksportuj | 4 |
| **razem** | **111** |

## `asus` — ASUS

| pole | plik | werdykt | uzasadnienie | zastępnik |
|---|---|---|---|---|
| `cover` | `asus-cover-3.jpg` | przeeksportuj | E: przeeksportować okładkę (pikseloza). | — |
| `approach[0].media[0]` | `asus-gallery-1.jpg` | zostaje | Post o Copilocie. | — |
| `approach[0].media[1]` | `asus-gallery-2.jpg` | usuń (odepnij) | #YOUTUBE — trzy osoby w kadrze, twarze widoczne. A/E: usunąć pozostałe grafiki wizerunkowe. | — |
| `approach[1].media[0]` | `asus-gallery-3.jpg` | zostaje | Kreacja produktowa ASUS. | — |
| `approach[1].media[1]` | `asus-gallery-4.jpg` | edytuj (anonimizacja) | #FACEBOOK — E: skadrować grafikę copywriterską do samych kreacji, bez treści posta nad nią. | — |
| `approach[2].media[0]` | `asus-gallery-5.jpg` | zostaje | Kreacja animacji. | — |
| `approach[3].media[0]` | `asus-gallery-6.jpg` | zostaje | #REELS — Technokrata, współpraca rozliczona (P 2026-08-18). | — |
| `approach[4].media[0]` | `asus-gallery-7.jpg` | zostaje | Baner produktowy. | — |
| `approach[4].media[1]` | `asus-gallery-8.jpg` | zostaje | Kreacja MuseTree. | — |

## `belvedere` — Belvedere

| pole | plik | werdykt | uzasadnienie | zastępnik |
|---|---|---|---|---|
| `cover` | `belvedere-cover.jpg` | przeeksportuj | A: pikselowa okładka; zdjęcie z galerii klienta — rozliczone. | — |
| `approach[0].media[0]` | `belvedere-gallery-1.jpg` | zostaje | Danie na talerzu. | — |
| `approach[1].media[0]` | `belvedere-gallery-2.jpg` | usuń (odepnij) | #POZYCJONOWANIE_EKSPERTÓW — portret szefa kuchni. A: usunąć. | — |
| `approach[2].media[0]` | `belvedere-gallery-3.jpg` | zostaje | Siatka kreacji IG. | — |
| `approach[3].media[0]` | `belvedere-gallery-4.jpg` | zostaje | Kreacja Bellunch. | — |
| `approach[3].media[1]` | `belvedere-gallery-5.jpg` | zostaje | Kreacja Bellunch. | — |
| `approach[4].media[0]` | `belvedere-gallery-6.jpg` | zostaje | Rolka produktowa. | — |

## `engie` — ENGIE

| pole | plik | werdykt | uzasadnienie | zastępnik |
|---|---|---|---|---|
| `cover` | `engie-cover.jpg` | zostaje | Pracownik pod światło, twarz nieczytelna. | — |
| `approach[0].media[0]` | `engie-gallery-1.jpg` | edytuj (anonimizacja) | Zegar 18:23 — skadrować status bar. | — |
| `approach[1].media[0]` | `engie-gallery-2.jpg` | edytuj (anonimizacja) | Zegar 18:55 — skadrować status bar. | — |
| `approach[2].media[0]` | `engie-gallery-3.jpg` | edytuj (anonimizacja) | Zegar 19:08. Ekspert ENGIE w kreacji klienta — zostaje. | — |
| `approach[3].media[0]` | `engie-gallery-4.jpg` | edytuj (anonimizacja) | #PERSONALBRANDING — P 2026-08-18: blur na twarz (ikonę) Kornelii; zdjęcie zostaje. | — |
| `approach[4].media[0]` | `engie-gallery-5.jpg` | edytuj (anonimizacja) | Zegar 19:16 — skadrować status bar. | — |
| `approach[4].media[1]` | `engie-gallery-6.jpg` | edytuj (anonimizacja) | Zegar 19:17 — skadrować status bar. | — |

## `fm-logistics` — FM Logistic

| pole | plik | werdykt | uzasadnienie | zastępnik |
|---|---|---|---|---|
| `cover` | `fm-logistics-cover.jpg` | zostaje | Ciężarówka w barwach FM. | — |
| `approach[0].media[0]` | `fm-logistics-gallery-1.jpg` | podmień | #LIDER_LOGISTYKI — portret pracownika FM („pan”). A: usunąć zdjęcia pracowników. E+P: w to miejsce zdjęcie stockowe (Pexels), bez znaków firmowych, z zapisaną proweniencją. | Pexels — do wyboru w zadaniu 5.5 |
| `approach[1].media[0]` | `fm-logistics-gallery-2.jpg` | podmień | #GREENSUPPLYCHAIN — nazwa pliku klienta odpowiada nagłówkowi filaru („Operator pierwszego wyboru”). Zegar 13:24 znika wraz z podmianą. | asana/fm-operator-pierwszego-wyboru.png |
| `approach[2].media[0]` | `fm-logistics-gallery-3.jpg` | zostaje | #CROSSDOCK — pierwsza grafika cross-dock, bez zegara i osób. | — |
| `approach[2].media[1]` | `fm-logistics-gallery-8.jpg` | podmień | #CROSSDOCK — druga grafika cross-dock. E: podmienić. Zegar 13:28 i linia reakcji z nazwiskiem znikają wraz z podmianą. | asana/fm-crossdock-swap.png |
| `approach[3].media[0]` | `fm-logistics-gallery-9.jpg` | podmień | #EMPLOYERBRANDING — grafika advocacy z portretem i nazwiskiem pracownika. A: usunąć. E+P: zdjęcie stockowe (Pexels). | Pexels — do wyboru w zadaniu 5.5 |
| `approach[4].media[0]` | `fm-logistics-gallery-7.jpg` | zostaje | #KAMPANIE — post o podcaście, bez wizerunku. | — |

## `imid-cmv` — LeczenieCMV.pl

| pole | plik | werdykt | uzasadnienie | zastępnik |
|---|---|---|---|---|
| `cover` | `imid-cmv-cover.jpg` | zostaje | Zdjęcie ciążowe, twarz poza kadrem. | — |
| `approach[0].media[0]` | `imid-cmv-gallery-1.jpg` | podmień | #EDUKACJA_O_CMV — nazwa pliku z Drive odpowiada nagłówkowi filaru. | drive/IMID/EDU 1 |
| `approach[0].media[1]` | `imid-cmv-gallery-2.jpg` | podmień | #EDUKACJA_O_CMV — j.w. | drive/IMID/EDU 2 |
| `approach[1].media[0]` | `imid-cmv-gallery-3.jpg` | podmień | #WALACYKLOWIR_A_IMMUNOGLOBULINY — nazwa pliku odpowiada nagłówkowi. | drive/IMID/walacyklowir kontra |
| `approach[1].media[1]` | `imid-cmv-gallery-4.jpg` | usuń (odepnij) | #WALACYKLOWIR_A_IMMUNOGLOBULINY — z Drive przyszedł jeden materiał na ten filar; filar skraca się do jednej pozycji (spec: krótsza sekcja bije substytut). | — |
| `approach[2].media[0]` | `imid-cmv-gallery-5.jpg` | podmień | #ZAUFANIE_I_WIARYGODNOSC — nazwa pliku odpowiada nagłówkowi. | drive/IMID/zaufanie 1 |
| `approach[2].media[1]` | `imid-cmv-gallery-6.jpg` | podmień | #ZAUFANIE_I_WIARYGODNOSC — j.w. | drive/IMID/zaufanie 2 |
| `approach[3].media[0]` | `imid-cmv-gallery-7.jpg` | podmień | #ZAANGAZOWANIE_I_DIALOG — nazwa pliku odpowiada nagłówkowi. | drive/IMID/zaangażowanie |
| `approach[3].media[1]` | `imid-cmv-gallery-8.jpg` | podmień | #ZAANGAZOWANIE_I_DIALOG — j.w. | drive/IMID/zaangażowana społ |

## `irobot` — iRobot

| pole | plik | werdykt | uzasadnienie | zastępnik |
|---|---|---|---|---|
| `cover` | `irobot-cover.jpg` | zostaje | E: okładka zostaje. | — |
| `approach[0].media[0]` | `irobot-gallery-3.jpg` | edytuj (anonimizacja) | #HUMOR — zegar 12:43 w status barze. | — |
| `approach[0].media[1]` | `irobot-gallery-6.jpg` | edytuj (anonimizacja) | #HUMOR — zegar 12:43. | — |
| `approach[1].media[0]` | `irobot-gallery-1.jpg` | podmień | #EDUKACJA — E: podmienić materiały „edukacja i technologia”. | asana/irobot-edu-tech-1.png |
| `approach[1].media[1]` | `irobot-gallery-2.jpg` | podmień | #EDUKACJA — j.w. | asana/irobot-edu-tech-2.png |
| `approach[2].media[0]` | `irobot-gallery-4.jpg` | podmień | #INNOWACJA — slot poziomy (zrzut z laptopa). E: wybrać najostrzejszy z trzech kandydatów w rozmiarze renderowanym. | asana/irobot-yt-{1,2,3}.png — wybór przy wgrywaniu |
| `approach[3].media[0]` | `irobot-gallery-5.jpg` | usuń (odepnij) | #DLAKAŻDEGO — cały filar usuwany (E). Media odpinane wraz z filarem, dokument zostaje. | — |

## `julius-meinl` — Julius Meinl

| pole | plik | werdykt | uzasadnienie | zastępnik |
|---|---|---|---|---|
| `cover` | `julius-meinl-cover.jpg` | podmień | P 2026-08-18: cover = logotyp Julius Meinl. Logo jest na przezroczystym tle — kompozyt na jednolitym tle w proporcji hero. | /mem/Julius_Meinl_(2004).svg.webp (kompozyt) |
| `approach[0].media[0]` | `julius-meinl-gallery-1.jpg` | podmień | #SZKOLENIA — kreacja z imieniem i twarzą pracownicy agencji (Olga). P: w to miejsce zdjęcie filiżanki. | asana/julius-main-banner.png |
| `approach[0].media[1]` | `julius-meinl-gallery-2.jpg` | usuń (odepnij) | #SZKOLENIA — druga kreacja z pracownicą agencji (Kornelia). P dał na ten filar jeden materiał — filar skraca się do jednej kreacji. | — |
| `approach[1].media[0]` | `julius-meinl-gallery-3.jpg` | zostaje | Latte art, bez osób. | — |
| `approach[1].media[1]` | `julius-meinl-gallery-4.jpg` | zostaje | FAKT czy MIT, bez osób. | — |
| `approach[2].media[0]` | `julius-meinl-gallery-5.jpg` | podmień | #EVENTY — dwie osoby przy stoisku, twarze widoczne. | asana/julius-eventy-1.png (grafika JUTRO / Barista Cup) |
| `approach[2].media[1]` | `julius-meinl-gallery-6.jpg` | podmień | #EVENTY — zdjęcie z eventu z rozpoznawalnymi osobami. | julius-eventy-still.jpg (kadr 2 s z julius-eventy.mov — stoisko Barista Cup, bez osób) |
| `approach[3].media[0]` | `julius-meinl-gallery-7.jpg` | podmień | #LIFESTYLE — P 2026-08-18: filar dostaje dwa wskazane materiały. | asana/julius-lifestyle.png (=15.42.52) |
| `approach[3].media[1]` | `julius-meinl-gallery-8.jpg` | podmień | #LIFESTYLE — j.w., druga pozycja. | asana/julius-eventy-2.png (=15.36.20) |
| `approach[4].media[0]` | `julius-meinl-gallery-9.jpg` | usuń (odepnij) | #ZRÓWNOWAŻONY_ROZWÓJ — twarz plantatorki w kadrze; wskazany wcześniej materiał lifestyle poszedł do filaru #LIFESTYLE (P 2026-08-18). Filar skraca się do Generations Programme. | — |
| `approach[4].media[1]` | `julius-meinl-gallery-10.jpg` | zostaje | Generations Programme, bez rozpoznawalnych twarzy. | — |

## `jw-construction` — JW Construction

| pole | plik | werdykt | uzasadnienie | zastępnik |
|---|---|---|---|---|
| `cover` | `jw-construction-cover.jpg` | podmień | E: podmienić główne zdjęcie; P 2026-08-18: stock z motywem deweloperskim. Okładka dopuszcza stock (bez znaków, proweniencja zapisana). | Pexels — branża deweloperska, wybór w 5.5 |
| `approach[0].media[0]` | `jw-construction-gallery-7.jpg` | zostaje | Kreacja Horizon Gdańsk. | — |
| `approach[1].media[0]` | `jw-construction-gallery-2.jpg` | usuń (odepnij) | #EDUKACJA — grafika „ekspercki content” (PRAWDA czy MIT). E: usunąć. | — |
| `approach[2].media[0]` | `jw-construction-gallery-8.jpg` | zostaje | Kreacja J.W. Club z modelami z sesji klienta. | — |
| `approach[3].media[0]` | `jw-construction-gallery-9.jpg` | zostaje | Kreacja „5 powodów”. | — |
| `approach[4].media[0]` | `jw-construction-gallery-5.jpg` | zostaje | #IDENTYFIKACJAWIZUALNA — E: „lewe zostawić powiększone”. To lewa pozycja filaru. | — |
| `approach[4].media[1]` | `jw-construction-gallery-6.jpg` | usuń (odepnij) | #IDENTYFIKACJAWIZUALNA — E: „prawe usunąć”. To prawa pozycja filaru; zawiera też linię z imieniem obserwującego. | — |

## `polomarket` — POLOmarket

| pole | plik | werdykt | uzasadnienie | zastępnik |
|---|---|---|---|---|
| `cover` | `polomarket-cover.jpg` | zostaje | Sklep z zewnątrz. | — |
| `approach[0].media[0]` | `polomarket-gallery-1.jpg` | edytuj (anonimizacja) | #MODERACJA — wątek z nazwiskiem i awatarem komentującej; imię powtarza się w odpowiedzi klienta. P: anonimizować — rozmyć awatar, pseudonim spójnie w obu miejscach. | — |
| `approach[0].media[1]` | `polomarket-gallery-2.jpg` | edytuj (anonimizacja) | #MODERACJA — j.w., drugi wątek. Pseudonim inny niż w wątku pierwszym. | — |
| `approach[1].media[0]` | `polomarket-gallery-3.jpg` | podmień | #SPRZEDAŻ „Zwiększanie zainteresowania zakupami” — A/E: podmiana grafiki. | drive/POLO/Zrzut ekranu 2026-08-17 o 16.00.05.png |
| `approach[2].media[0]` | `polomarket-gallery-4.jpg` | zostaje | #KONKURSY — kreacja konkursowa, bez osób. | — |

## `pracuj-pl` — Pracuj.pl

| pole | plik | werdykt | uzasadnienie | zastępnik |
|---|---|---|---|---|
| `cover` | `pracuj-pl-cover.jpg` | zostaje | Dłonie z telefonem. | — |
| `approach[1].media[0]` | `pracuj-pl-ar-grid.jpg` | edytuj (anonimizacja) | FILTR AR — skadrować zegar 14:23 (P 2026-08-18). | — |
| `approach[1].media[1]` | `pracuj-pl-ar-creator.jpg` | usuń (odepnij) | FILTR AR — „dziewczyna po prawej”: P 2026-08-18 usunąć; filar skraca się do siatki. | — |
| `approach[2].media[0]` | `pracuj-pl-edu.jpg` | podmień | #CONTENT edukacyjny — zegar 15:40 znika wraz z podmianą. | drive/Pracuj/EDU 1 (+ EDU 2 jako druga pozycja filaru) |
| `approach[3].media[0]` | `pracuj-pl-humor-cat.jpg` | podmień | #CONTENT humorystyczny — zegar 16:09 znika wraz z podmianą. | drive/Pracuj/FUNNY 1 |
| `approach[3].media[1]` | `pracuj-pl-humor-pov.jpg` | podmień | #CONTENT humorystyczny — zegar 16:10 znika wraz z podmianą. | drive/Pracuj/FUNNY 2 (+ FUNNY 3 jako trzecia pozycja filaru) |
| `approach[5].media[0]` | `pracuj-pl-influencer.jpg` | zostaje | #INFLUENCER MARKETING — portret influencera z kampanii klienta. | — |

## `riviera` — Centrum Riviera

| pole | plik | werdykt | uzasadnienie | zastępnik |
|---|---|---|---|---|
| `cover` | `riviera-cover.jpg` | przeeksportuj | E: przeeksportować okładkę (pikseloza). | — |
| `approach[0].media[0]` | `riviera-gallery-1.jpg` | zostaje | Kreacja wielkanocna z modelką w sesji klienta. | — |
| `approach[1].media[0]` | `riviera-gallery-2.jpg` | edytuj (anonimizacja) | Nagłówek posta taguje osobę trzecią z imienia i nazwiska — pseudonim „Julią Zając” (znalezione przy weryfikacji renderu). | riviera-gallery-2-anon.jpg |
| `approach[1].media[1]` | `riviera-gallery-3.jpg` | edytuj (anonimizacja) | #PROMOCJA — „duża pisanka”: E: skadrować tak, by zniknął pasek odtwarzacza i była pracownica. | — |
| `approach[2].media[0]` | `riviera-gallery-4.jpg` | usuń (odepnij) | #WIDEO — grafika „pan” przy sekcji wzruszającego wideo. E: usunąć. | — |
| `approach[2].media[1]` | `riviera-gallery-5.jpg` | zostaje | Baner #potrafie. | — |
| `approach[3].media[0]` | `riviera-gallery-6.jpg` | edytuj (anonimizacja) | #REAL_TIME_MARKETING — story z prywatnego konta z twarzą i nickiem; poza audytem, zgłoszone przez nas. Domyślnie: blur twarzy i nicku (linia P: anonimizacja). | — |
| `approach[4].media[0]` | `riviera-gallery-7.jpg` | zostaje | Kreacja karty podarunkowej. | — |
| `approach[4].media[1]` | `riviera-gallery-8.jpg` | zostaje | Kreacja RL9. | — |

## `skrzat` — Skrzat. Nowy początek

| pole | plik | werdykt | uzasadnienie | zastępnik |
|---|---|---|---|---|
| `cover` | `skrzat-cover.jpg` | zostaje | Kadr z filmu — aktorzy rozliczeni (P: „już wiem że możemy”). | — |
| `approach[0].media[0]` | `skrzat-gallery-1.jpg` | zostaje | Kreacja graficzna, bez wizerunku. | — |
| `approach[1].media[0]` | `skrzat-gallery-2.jpg` | zostaje | Kreacja z aktorami filmu — rozliczeni. | — |
| `approach[1].media[1]` | `skrzat-gallery-3.jpg` | zostaje | Kreacja z planu, aktor — rozliczony. | — |
| `approach[2].media[0]` | `skrzat-gallery-4.jpg` | zostaje | Zrzut posta konkursowego, brak osób trzecich. | — |
| `approach[3].media[0]` | `skrzat-gallery-5.jpg` | zostaje | #PLAN — aktorzy filmu, rozliczeni (P 2026-08-18). | — |
| `approach[3].media[1]` | `skrzat-gallery-6.jpg` | zostaje | #PLAN — aktorzy filmu, rozliczeni (P 2026-08-18). | — |
| `approach[4].media[0]` | `skrzat-gallery-7.jpg` | zostaje | Post IG z aktorką — rozliczona. | — |
| `approach[4].media[1]` | `skrzat-gallery-8.jpg` | zostaje | TikTok z aktorami — rozliczeni. | — |

## `vistula` — Vistula

| pole | plik | werdykt | uzasadnienie | zastępnik |
|---|---|---|---|---|
| `cover` | `vistula-cover-3.jpg` | przeeksportuj | A: pikselowa okładka — przeeksportować w rozdzielczości hero. | — |
| `approach[0].media[0]` | `vistula-gallery-1.jpg` | zostaje | Kreacja graficzna. | — |
| `approach[0].media[1]` | `vistula-gallery-2.jpg` | zostaje | Kreacja graficzna. | — |
| `approach[1].media[0]` | `vistula-gallery-3.jpg` | zostaje | Kreacja graficzna. | — |
| `approach[1].media[1]` | `vistula-gallery-4.jpg` | zostaje | Kreacja graficzna. | — |
| `approach[2].media[0]` | `vistula-gallery-5.jpg` | zostaje | Kreacja graficzna. | — |
| `approach[2].media[1]` | `vistula-gallery-6.jpg` | zostaje | Kreacja graficzna. | — |
| `approach[3].media[0]` | `vistula-gallery-7.jpg` | edytuj (anonimizacja) | #AKTYWNA_MODERACJA — wątek z nazwiskiem komentującego („Ernest Jasiński”). P: anonimizować zamiast usuwać — pseudonim, spójnie w całym wątku. | — |
| `approach[3].media[1]` | `vistula-gallery-8.jpg` | zostaje | Wątek zawiera wyłącznie wypowiedź konta klienta. | — |

## `volvo` — Volvo Car Warszawa & Dom Volvo

| pole | plik | werdykt | uzasadnienie | zastępnik |
|---|---|---|---|---|
| `cover` | `volvo-cover.jpg` | zostaje | Detal wnętrza, bez osób. | — |
| `approach[0].media[0]` | `volvo-vcw-post.jpg` | edytuj (anonimizacja) | Zegar 12:00 w status barze + linia reakcji z nazwą konta pracownika agencji. Skadrować zegar, zanonimizować linię reakcji. | — |
| `approach[1].media[0]` | `volvo-vcw-goracy.jpg` | edytuj (anonimizacja) | Zegar 12:14 + ta sama linia reakcji. | — |
| `approach[1].media[1]` | `volvo-dom-savedate.jpg` | edytuj (anonimizacja) | Zegar 12:21 — skadrować status bar. | — |
| `approach[2].media[0]` | `volvo-event-safety.jpg` | usuń (odepnij) | #Współpraca eventowa — dwie osoby są tematem kadru, twarze w pełni widoczne, brak rozliczenia. Reguła: osoba jako temat → usunięcie (decyzja delegowana, P 2026-08-18). | — |
| `approach[2].media[1]` | `volvo-event-noc.jpg` | zostaje | #Współpraca eventowa — osoby peryferyjne, twarze małe i w cieniu, nierozpoznawalne (decyzja delegowana, P 2026-08-18). | — |
| `approach[2].media[2]` | `volvo-event-ex30.jpg` | zostaje | Samochód, bez osób. | — |
| `approach[3].media[0]` | `volvo-konkurs-podium.jpg` | podmień | KONKURS „Volvo oczami dzieci” — podium z dziećmi i medalami (zdjęcie z pikniku modelarskiego). A: usunąć. E: w to miejsce materiał z konkursu. | volvo-konkurs-warsztat.jpg (kadr 28 s z volvo-konkurs-podsumowanie.mp4 — stół plastyczny, bez twarzy i bez imion) |

## Załącznik A — pseudonimy (spójne w obrębie wątku)

| plik | oryginał | pseudonim |
|---|---|---|
| vistula-gallery-7 | Ernest Jasiński | Michał Zawadzki |
| riviera-gallery-2 | Julia C. (tag w nagłówku) | Julia Zając |
| polomarket-gallery-1 | Maria Gdula / „Maria,” | Marta Gajda / „Marta,” |
| polomarket-gallery-2 | Hanna Kopczewska / „Hanna,” | Wanda Sokołowska / „Wanda,” |

Blur bez pseudonimu: awatary komentujących (polomarket ×2), awatar+nick w linii polubień (volvo ×2: konto pracownicy agencji), twarz+awatar+nick w story (riviera-gallery-6), twarz Kornelii (engie-gallery-4). Zegary: skadrowane w płaskich zrzutach, rozmyte plamką w mockupach telefonów (skrzat ×3, irobot ×2 pozostające).

## Załącznik B — proweniencja stocka (Pexels License, pobrano 2026-08-18)

| plik | slot | strona Pexels |
|---|---|---|
| fm-logistics-lider-1.jpg | fm approach[0] #LIDER_LOGISTYKI | https://www.pexels.com/photo/5025643/ |
| fm-logistics-employerbranding-1.jpg | fm approach[3] #EMPLOYERBRANDING | https://www.pexels.com/photo/4483938/ |
| jw-construction-cover-2.jpg | jw cover | https://www.pexels.com/photo/balconies-of-a-modern-apartment-building-16110999/ |

Odrzuceni: 38136632 (logo Columbia), 31199539 (emblemat na koszuli). Alty opisują zdjęcia wprost jako ilustracyjne — bez przypisywania klientowi.

## Załącznik C — kadry z wideo (zamiast rozszerzania schematu o wideo)

`media.mimeTypes = ['image/*']`; obsługa wideo w approach to zmiana schematu — decyzja P 2026-08-18: kadry teraz, wideo jako osobna zmiana.

| plik | źródło | kadr |
|---|---|---|
| volvo-konkurs-warsztat.jpg | volvo-konkurs-podsumowanie.mp4 | 28 s — stół plastyczny, bez twarzy i podpisanych prac |
| julius-meinl-eventy-2.jpg | julius-eventy.mov | 2 s — stoisko Barista Cup, bez osób |

## Załącznik D — partia follow-up (komentarze Anny na Asanie, 2026-08-18)

| study | akcja |
|---|---|
| produkty-cukiernicze-brzesc | gallery-3 (wątek z 4 nazwiskami) → komiks „Dobrze nadziany” z Drive; gallery-7 (6 twarzy pracowników, targi ISM) odpięte — materiał zastępczy w toku (1 plik Drive niedostępny dla konta goodone, link FB wymaga logowania, komentarz ucięty „See more”) |
| rabkoland | A: „najlepiej bez zdjęć” — odpięte gallery-2…7 (zdjęcia z sesji klienta, brak zgód); gallery-1 (maskotka) zostaje z blurem awatara i nicku komentującej |
| belvedere | „bez fotek” = zdjęcia osób; po usunięciu szefa kuchni nie ma już fotografii osób (grid = dania/wnętrza/dłonie) — bez dalszych zmian |
| riviera | gallery-6 (story ewel0ny) COFNIĘTE do oryginału — P 2026-08-18: anonimizacja była nadgorliwa (publiczna influencerka, tekst filaru i tak wymienia nick) |

## Okładki (5.6) — rozstrzygnięte

Decki przeszukane percepcyjnie: riviera = ten sam render w 800px, belvedere = identyczny plik 787px, vistula/asus w ogóle nie pochodzą z decków. Za zgodą P: stock Pexels dopasowany do typu klienta (szklana fasada / aula / laptop przy oknie / stół fine-dining), bez obcych znaków, proweniencja w załączniku B; zastosowane na dev.
