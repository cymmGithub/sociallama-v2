# Case studies — status (2026-07-24)

48 case studies opublikowanych (3 oryginalne + 45 zaimportowanych z decków w `/mem/claude-cs`). Treść tylko PL — tłumaczenie na EN to osobna, jeszcze nierozpoczęta zmiana.

## Inwentaryzacja

| Stan | Liczba | Case studies |
|---|---|---|
| Solidne | 41 | pełny pipeline, realne metryki, brak zastrzeżeń |
| Ubogie | 3 | `kbp`, `luisse`, `mmhygienic` — zaimportowane, ale poniżej poziomu treści (skąpe decki) |
| Zablokowane | 1 | `medicover` — deck źródłowy w `/mem` był uszkodzony (w rzeczywistości była to treść Vistuli); potrzebny prawdziwy deck, mount `/mem` już nie istnieje |
| Oryginalne | 3 | `irobot`, `pracuj-pl`, `volvo` |

Dwa zastrzeżenia do sprawdzenia przed realnym uruchomieniem: liczby "koszt fana" oraz "12 mln TikTok fanów" dla `polomarket` — przepisane dosłownie z decku, ale niezweryfikowane pod kątem wiarygodności.

## Karuzela ZAUFALI NAM — co można podpiąć

Karuzela logotypów klientów na stronie głównej (`lib/content/home.ts`) pokazuje 12 klientów. Przycisk CTA na karcie prowadzi do case study **tylko jeśli** dany klient ma ustawione `caseStudySlug`.

| Klient w karuzeli | Ma case study? | Referencja (testimonial) | Można podpiąć teraz? |
|---|---|---|---|
| **Aquael** | ✅ `aquael` | Prawdziwa (Beata Nartowska) | ✅ **Podpięte (2026-07-25)** — `caseStudySlug` dodane w PL i EN. Uwaga: case study ma na razie tylko treść PL, EN wyświetli się przez fallback. |
| pracuj.pl | ✅ `pracuj-pl` | ⚠️ Placeholder | Już podpięte (`caseStudySlug` ustawione) — ale na **żywej stronie** widoczny jest fałszywy cytat. Do poprawy jest referencja, nie link. |
| Kontigo | ✅ `kontigo` | ⚠️ Placeholder | Zablokowane — potrzebna prawdziwa referencja, zanim podpięcie CTA ma sens |
| Riviera | ✅ `riviera` | ⚠️ Placeholder | Zablokowane — jak wyżej |
| Medicover Sport | 🚫 `medicover` zablokowany | ⚠️ Placeholder | Nie — case study jeszcze nie istnieje, a i tak nie wiadomo, czy "Medicover Sport" to ten sam podmiot co zablokowany deck "Medicover" |
| Aflofarm | ❌ brak decku | ⚠️ Placeholder | Nie — poza zestawem 46 decków |
| Funtronic | ❌ brak decku | Prawdziwa | Nie — poza zestawem 46 decków |
| Intrum Justitia | ❌ brak decku | Prawdziwa | Nie — poza zestawem 46 decków |
| Oryginalny Sok | ❌ brak decku | ⚠️ Placeholder | Nie — poza zestawem 46 decków |
| Press-Service | ❌ brak decku | ⚠️ Placeholder | Nie — poza zestawem 46 decków |
| Uniphar | ❌ brak decku | Prawdziwa | Nie — poza zestawem 46 decków |
| Worldline | ❌ brak decku | ⚠️ Placeholder | Nie — poza zestawem 46 decków |

**Priorytety działań:**
1. **`pracuj.pl`** — podmienić placeholder na prawdziwą referencję. To jedyny klient już podpięty do realnego case study, który na żywo pokazuje fałszywy cytat.
2. ~~**`aquael`** — dodać `caseStudySlug`.~~ ✅ Zrobione 2026-07-25.
3. **`kontigo`, `riviera`** — pozyskać prawdziwe referencje, potem podpiąć `caseStudySlug`.

## Brakujące referencje (wszystkie oznaczone `// TODO: placeholder — replace before launch`)

8 z 12 klientów w karuzeli: **Aflofarm, Kontigo, Medicover Sport, Oryginalny Sok, Press-Service, Riviera, Worldline, pracuj.pl**.

Tylko 4 mają prawdziwe referencje: Aquael, Funtronic, Intrum Justitia, Uniphar.
