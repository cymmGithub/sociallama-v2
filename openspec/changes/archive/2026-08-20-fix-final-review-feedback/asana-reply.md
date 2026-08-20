# Asana — draft odpowiedzi (do akceptacji Przemka przed wysłaniem)

Zadanie: **Finalna weryfikacja strony www <3** (1217405077214092), komentarz
Ani z 19.08.2026.

**NIE WYSYŁAĆ bez zgody.** Dwa punkty (⚠️) wymagają decyzji Ani.

---

Cześć Aniu! Wszystkie uwagi z Twojej listy są już wdrożone na wersji roboczej.
Poniżej co dokładnie zostało zrobione, plus dwa pytania do Ciebie.

**Layout i sekcje**

1. **Nakładający się tekst na kółku „DLACZEGO TO DZIAŁA” (branże)** — naprawione.
   Błąd był specyficzny dla Safari na Macu (w Chrome wyglądało poprawnie, dlatego
   wcześniej nam umknął): kafelki z hasłami traciły swoje położenie i lądowały
   dokładnie na środku, pod napisem. Przy okazji poprawiliśmy też ciasnotę na
   węższych ekranach — na wszystkich 12 stronach branżowych kafelki nie dotykają
   już środka na żadnej szerokości.
2. **Sekcja „Benefity, których naprawdę używamy” (Zostań lamą)** — usunięta w
   całości. Strona idzie teraz: nagłówek → oferty pracy → formularz.

**Teksty**

3. **Lead nad formularzem (Zostań lamą)** — zamieniony na Twój:
   „Chcesz zdobywać nowe umiejętności w świecie social mediów? Aplikuj do Social
   Lamy”.
4. **Biogramy zespołu** — wszystkie „od X lat” zamienione na konkretny rok, żeby
   nie trzeba było ich co roku poprawiać (patrz pytanie ⚠️ 1 niżej).
5. **„Coś o Lamie”** — treść zastąpiona wersją „Pod www” z Twojego dokumentu
   *Social Lama - BIO* (patrz pytanie ⚠️ 2 niżej).
6. **Liczby w sekcji kontaktowej** — 500 000 → **514 000** zaangażowanych fanów,
   7 000 000 → **7 260 000** zasięgu na Facebooku. 528 i 80 bez zmian.

**Case studies**

7. **Volvo** — podpis pod logo mówił tylko „DOM VOLVO”; teraz czyta się
   **VOLVO CAR WARSZAWA & DOM VOLVO**. Ta sama zła wersja podpisu była też na
   belce klientów na stronie głównej — poprawiliśmy w obu miejscach.
8. **Pracuj.pl** — wszystkie kreacje zdjęte (nie są naszą pracą). Jako obrazek
   główny wstawiliśmy neutralne zdjęcie stockowe (Pexels, licencja darmowa —
   te same warunki co zdjęcia na stronach branżowych), żeby kafelek na liście
   case studies nie był pusty i nie sugerował autorstwa. Opisy sekcji bez
   zmian.
9. **iRobot** — nowy obrazek główny (Roomba w salonie) i papuga w miejsce zdjęć
   w filarze „#HUMOR / Podkreślenie korzyści i wygody”.
10. **Breville** — logo poprawione na oficjalne (czarny wordmark z czerwoną
    kropką) zamiast dotychczasowego fioletowego.

**Dodatkowo, poza Twoją listą**

11. **/o nas** — ilustracja przy „Coś o Lamie” zastąpiona zdjęciem zespołu
    (z zaokrągleniem rogów takim samym jak kafelki „Ostatnio zrealizowane
    projekty”).

---

## ⚠️ Dwie rzeczy do Twojej decyzji

**⚠️ 1 — Który rok przy biogramach?**

Twoja zasada „bez liczby lat” wymaga podania konkretnego roku, a z zapisu
„od ponad X lat” nie wynika jednoznacznie który. Policzyliśmy 2026 − X, czyli
**najpóźniejszy możliwy rok** — to bezpieczny kierunek (jeśli ktoś pracuje
dłużej, zapis dalej jest prawdziwy), ale warto go potwierdzić z zespołem:

| Osoba | Było | Jest |
| --- | --- | --- |
| ROKICKA | od ponad 12 lat | od 2014 roku |
| KLAJBERT | Od 5 lat | od 2021 roku |
| KAPTUR | od ponad 4 lat | od 2022 roku |
| WITEWSKA | od ponad 10 lat | od 2016 roku |
| PŁOCIŃSKI | od ponad piętnastu lat | od 2011 roku |

Jeśli któraś data jest nie ta — daj znać, poprawimy punktowo.

**⚠️ 2 — „ponad 13 lat” w BIO**

W dokumencie *Social Lama - BIO* wersja „Pod www” zaczyna się od
„działająca na rynku **ponad 13 lat**”, co jest dokładnie tym zapisem, który
kazałaś usunąć z biogramów. Zastosowaliśmy tę samą zasadę i na stronie jest
**„działająca na rynku od 2013 roku”**. Jeśli wolisz zostawić oryginalne
brzmienie z dokumentu — powiedz, zmienimy z powrotem.

---

## Uwagi wewnętrzne (nie do wysyłki)

- **Wdrożenie na produkcję.** Wszystko powyżej jest na bazie deweloperskiej.
  Przeniesienie treści case studies na produkcję to osobny, świadomie
  zatwierdzany krok (skrypty mają tryb `--prod`); po nim potrzebny jest deploy
  i `vercel cache purge`, bo `/api/media/file/*` ma roczny cache.
- **Breville — inna przyczyna niż zakładaliśmy.** `client.logo` w Payloadzie był
  już poprawny (czarne mono). Fioletowy znak, który Ania sfotografowała, to
  `public/case-studies/breville/breville-logo.png`, czytany przez kafelek
  „powiązane case studies” na stronach branżowych, który sięga po plik z
  `public/`, a nie po bazę. Poprawka poszła tam.
- **Powtórzenie „Aplikuj”.** Nowy lead kończy się „Aplikuj do Social Lamy” i stoi
  bezpośrednio pod nagłówkiem „Aplikuj śmiało i kreatywnie”. Nagłówka nie
  ruszaliśmy — to decyzja copy, nie techniczna. Warto dopytać Anię.
- **Pracuj.pl — pusta kolumna.** Po zdjęciu kreacji filary mają samą treść, więc
  prawa kolumna sekcji „Podejście” jest pusta na całej długości. Zgodnie z
  wcześniejszą decyzją zostawiamy uczciwą pustkę zamiast rozciągania treści.
- **Usunięte pliki.** 9 osieroconych rekordów media skasowanych
  (`delete-review-orphans.ts`, każdy sprawdzony na zero referencji w całej
  bazie). Pliki źródłowe zostają w `public/case-studies/<slug>/`, więc powrót
  jest możliwy przez ponowny upload.
- **Nadal odłożone** (decyzja Przemka z 20.08): autorstwo wpisów na blogu,
  przegląd zgód na zdjęcia klientów w case studies, oraz partia grafik od Emilii
  z 17.08 (Riviera, JW, POLOmarket, ASUS, IMID).
