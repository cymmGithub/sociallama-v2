import cn from 'clsx'
import type { Metadata } from 'next'
import { CookieTable } from '@/components/consent/cookie-table'
import { Wrapper } from '@/components/layout/wrapper'
import { Link } from '@/components/ui/link'
import { CONSENT_COOKIE_NAME } from '@/lib/consent/cookie'
import {
  consentCategories,
  consentTable,
  consentTrigger,
} from '@/lib/content/consent'
import { pairMetadata } from '@/lib/utils/metadata'
import s from '../[slug]/post.module.css'

/*
 * Privacy policy — static page migrated from the WordPress page
 * `/polityka-prywatnosci/` (migrate-wp-content, page disposition: keep).
 * Reuses the post template's CSS module: same long-form article surface, on
 * the `.headerPlain` variant because there is no plum stage behind the title.
 *
 * Content follows the group template (matching diea.pl/polityka-prywatnosci):
 * Good One sp. z o.o. is the controller, and Artykuł 7 names this site. Its
 * osiedle-rozalin.pl reference in Artykuł 7 was a copy-paste error and has
 * been corrected.
 *
 * The WP original's restarting list numbering is NOT preserved: rendered, it
 * put seven consecutive items at "1." in Artykuł 5, because each gloss
 * paragraph closed the <ol> and the next right opened a fresh one. Those
 * glosses and sub-lists now sit inside the item they belong to, so each
 * article numbers continuously. Wording is unchanged by that move — nothing in
 * the document cross-references those numbers (the one "pkt" reference, in
 * Artykuł 7, points at a list this leaves alone).
 *
 * Keep in sync with the EN twin at `/en/privacy-policy`.
 */

export const metadata: Metadata = pairMetadata({
  title: 'Polityka prywatności',
  description:
    'Polityka prywatności i informacja o sposobie ochrony danych osobowych użytkowników strony sociallama.pl.',
  path: '/polityka-prywatnosci',
})

export default function PrivacyPolicyPage() {
  return (
    <Wrapper theme="cream">
      <article className={s.article}>
        <header className={cn(s.header, s.headerPlain)}>
          <h1 className={s.title}>Polityka prywatności</h1>
          <p className={s.lead}>
            Polityka prywatności i&nbsp;informacja o&nbsp;sposobie ochrony
            danych osobowych użytkowników strony internetowej.
          </p>
        </header>

        <div className={s.body}>
          <h2>Artykuł 1. Administrator</h2>
          <ol>
            <li>
              Administratorem danych osobowych jest Good One sp. z&nbsp;o.o.
              z&nbsp;siedzibą we Wrocławiu, ul. Januszowicka 5/121;
              53-135&nbsp;Wrocław, NIP: 525-287-21-79; KRS: 0000914751; REGON:
              389646858 (dalej „<strong>Administrator</strong>”), który
              przykłada dużą wagę do ochrony prywatności i&nbsp;poufności danych
              osobowych swoich Klientów i&nbsp;innych osób fizycznych, których
              dane są przez Administratora przetwarzane (zwanych dalej „
              <strong>Użytkownikami</strong>”).
            </li>
            <li>
              Z&nbsp;Administratorem można kontaktować się pisemnie, kierując
              korespondencję na adres siedziby Administratora, e-mailowo pod
              adresem: kontakt@goodone.co lub poprzez wypełnienie formularza
              kontaktowego dostępnego na stronie internetowej Administratora.
            </li>
            <li>
              Administrator nie wyznaczył Inspektora ochrony danych osobowych.
            </li>
          </ol>

          <h2>Artykuł 2. Zasady przetwarzania danych osobowych</h2>
          <ol>
            <li>
              Administrator przetwarza dane osobowe w&nbsp;minimalnym zakresie
              koniecznym do realizacji celów ich przetwarzania, określonych
              jasno niniejszą Polityką Prywatności.
            </li>
            <li>
              Administrator z&nbsp;należytą starannością dobiera i&nbsp;stosuje
              odpowiednie środki techniczne i&nbsp;organizacyjne zapewniające
              ochronę przetwarzanych danych osobowych. Pełen dostęp do baz
              danych posiadają jedynie osoby należycie uprawnione przez
              Administratora.
            </li>
            <li>
              Administrator zabezpiecza dane osobowe przed ich udostępnieniem
              osobom nieupoważnionym, jak również przed ich przetwarzaniem
              z&nbsp;naruszeniem obowiązujących przepisów prawa. Administrator
              przetwarzając dane osobowe stosuje rozwiązania dostosowane do
              skali i&nbsp;charakteru przetwarzania zapewniając osobom, których
              dane dotyczą, najwyższy stopień ochrony wynikający zarówno ze
              stosowanych rozwiązań technologicznych, jak
              i&nbsp;organizacyjnych.
            </li>
            <li>
              Przetwarzane będą następujące dane osobowe: imię i&nbsp;nazwisko,
              adres e-mail, nr telefonu.
            </li>
          </ol>

          <h2>Artykuł 3. Podstawa przetwarzania danych osobowych</h2>
          <ol>
            <li>
              Podane przez Użytkownika dane osobowe przetwarzane są zgodnie
              z&nbsp;niniejszą Polityką Prywatności oraz obowiązującymi
              przepisami prawa, w&nbsp;szczególności zgodnie
              z&nbsp;rozporządzeniem Parlamentu Europejskiego i&nbsp;Rady (UE)
              2016/679 z&nbsp;27.04.2016 r. w&nbsp;sprawie ochrony osób
              fizycznych w&nbsp;związku z&nbsp;przetwarzaniem danych osobowych
              i&nbsp;w&nbsp;sprawie swobodnego przepływu takich danych oraz
              uchylenia dyrektywy 95/46/WE z&nbsp;dnia 27 kwietnia 2016 r.
              („RODO”).
            </li>
            <li>
              Podanie danych osobowych jest dobrowolne, jednakże ich niepodanie
              spowoduje, że zawarcie i&nbsp;realizacja umowy, przesłanie
              zapytania lub wykonanie wnioskowanych czynności będzie niemożliwe.
            </li>
            <li>
              Podstawą przetwarzania danych osobowych jest:
              <ul>
                <li>
                  art. 6 ust. 1 lit. a&nbsp;RODO – w&nbsp;zakresie danych
                  osobowych uzyskanych za pomocą zgody, na warunkach określonych
                  w&nbsp;art. 7 RODO;
                </li>
                <li>
                  art. 6 ust. 1 lit. b RODO – w&nbsp;zakresie danych podawanych
                  dobrowolnie w&nbsp;celu udzielania odpowiedzi na wszelkie
                  skierowane zapytania lub wnioski oraz prowadzenie dalszej
                  korespondencji czy kontaktu przed zawarciem umowy, jak również
                  przygotowania i&nbsp;realizacji Umowy pomiędzy Użytkownikiem
                  a&nbsp;Administratorem lub podmiotem, któremu Administrator
                  zleca wykonanie Umowy;
                </li>
                <li>
                  art. 6 ust. 1 lit. f RODO – w&nbsp;zakresie danych
                  przetwarzanych w&nbsp;związku z&nbsp;realizacją prawnie
                  uzasadnionych celów Administratora.
                </li>
              </ul>
              <p>
                Podanie danych jest dobrowolne, jednak niezbędne do realizacji
                Umowy lub prowadzenia korespondencji z&nbsp;Administratorem.
              </p>
            </li>
            <li>
              Administrator może przetwarzać dane osób trzecich udostępnione
              przez Użytkowników w&nbsp;celu lub w&nbsp;związku ze świadczeniem
              usług przez Administratora. Użytkownik, przekazując
              Administratorowi dane osób trzecich, każdorazowo oświadcza, że
              posiada stosowną zgodę osób trzecich na przekazanie ich danych
              Administratorowi.
            </li>
            <li>
              Użytkownik w&nbsp;razie zmiany danych osobowych, o&nbsp;których
              mowa w&nbsp;niniejszej Polityce Prywatności, poinformuje
              niezwłocznie Administratora w&nbsp;celu aktualizacji danych
              osobowych.
            </li>
            <li>
              Administrator nie stosuje wobec Użytkowników profilowania
              w&nbsp;rozumieniu art. 4 pkt 4) RODO.
            </li>
          </ol>

          <h2>Artykuł 4. Okres przetwarzania danych osobowych</h2>
          <p>
            Dane Użytkownika przechowywane będą nie dłużej niż jest to
            konieczne, tj.:
          </p>
          <ul>
            <li>
              w&nbsp;zakresie prowadzenia korespondencji – dane osobowe będą
              przechowywane przez okres niezbędny do obsługi zapytania, tj.
              okres trwania korespondencji uzasadniony rodzajem zapytania
              (jednak nie dłużej niż przez okres 6 miesięcy od daty zakończenia
              korespondencji);
            </li>
            <li>
              w&nbsp;zakresie wykonania umowy – do czasu zakończenia realizacji
              umowy, a&nbsp;po tym czasie przez okres wymagany przez przepisy
              prawa lub dla realizacji ewentualnych roszczeń, jakie może
              podnosić Administrator i&nbsp;jakie mogą być podnoszone wobec
              Administratora;
            </li>
            <li>
              w&nbsp;zakresie wypełniania obowiązku prawnego ciążącego na
              Administratorze – do czasu jego wypełnienia;
            </li>
            <li>
              w&nbsp;zakresie realizacji prawnie uzasadnionych interesów przez
              Administratora lub przez stronę trzecią – do czasu ich realizacji
              lub do czasu wniesienia przez Użytkownika sprzeciwu wobec
              przetwarzania danych osobowych, o&nbsp;ile nie występują
              uzasadnione podstawy dalszego przetwarzania;
            </li>
            <li>
              w&nbsp;zakresie przetwarzania realizowanego wyłącznie
              w&nbsp;oparciu o&nbsp;zgodę – do czasu niezwłocznego usunięcia
              danych, zrealizowanego w&nbsp;oparciu o&nbsp;zgłoszone przez
              Użytkownika żądanie.
            </li>
          </ul>

          <h2>Artykuł 5. Prawa Użytkownika</h2>
          <ol>
            <li>
              W&nbsp;związku z&nbsp;przetwarzaniem danych osobowych przez
              Administratora, Użytkownik ma prawo do:
              <ul>
                <li>
                  żądania dostępu do danych osobowych – art. 15 RODO;
                  <p>
                    Na żądanie Użytkownika dotyczące dostępu do jego danych
                    Administrator informuje Użytkownika, czy przetwarza jego
                    dane, oraz informuje Użytkownika o&nbsp;szczegółach
                    przetwarzania zgodnie z&nbsp;RODO, a&nbsp;także udziela
                    Użytkownikowi dostępu do danych go dotyczących. Dostęp do
                    danych będzie zrealizowany przez przesłanie kopii danych
                    drogą elektroniczną. W&nbsp;przypadku żądania dostarczenia
                    kolejnej kopii danych w&nbsp;formie papierowej Administrator
                    ma prawo obciążyć Użytkownika kosztami związanymi z&nbsp;ich
                    przygotowaniem w&nbsp;takiej formie i&nbsp;wysłaniem zgodnie
                    z&nbsp;art. 15 ust. 3 RODO.
                  </p>
                </li>
                <li>
                  sprostowania danych osobowych – art. 16 RODO;
                  <p>
                    Administrator dokonuje sprostowania nieprawidłowych danych
                    na żądanie Użytkownika.
                  </p>
                </li>
                <li>
                  żądania usunięcia danych osobowych – art. 17 RODO;
                  <p>
                    Prawo to obowiązuje w&nbsp;zakresie, w&nbsp;jakim usunięcie
                    danych nie stoi w&nbsp;sprzeczności z&nbsp;obowiązującymi
                    Administratora przepisami.
                  </p>
                </li>
                <li>
                  ograniczenia przetwarzania danych – art. 18 RODO;
                  <p>
                    Prawo to obowiązuje w&nbsp;zakresie, w&nbsp;jakim
                    Administrator może ograniczyć przetwarzanie danych osobowych
                    w&nbsp;kontekście obowiązujących go przepisów oraz
                    w&nbsp;jakim nie narusza to prawa Administratora do
                    dochodzenia swoich roszczeń od Użytkownika.
                  </p>
                </li>
                <li>
                  przenoszenia danych – art. 20 RODO;
                  <p>
                    Na żądanie Użytkownika Administrator wydaje
                    w&nbsp;ustrukturyzowanym, powszechnie używanym formacie
                    nadającym się do odczytu maszynowego lub przekazuje innemu
                    podmiotowi, jeśli jest to możliwe, dane dotyczące
                    Użytkownika, który dostarczył je w&nbsp;celu zawarcia lub
                    wykonania Umowy lub które przetwarzane są na podstawie
                    zgody.
                  </p>
                </li>
                <li>
                  wniesienia sprzeciwu wobec przetwarzania – art. 21 RODO;
                  <p>
                    Jeżeli Użytkownik zgłosi umotywowany jego szczególną
                    sytuacją sprzeciw względem przetwarzania jego danych
                    a&nbsp;dane są przetwarzane przez Administratora
                    w&nbsp;oparciu o&nbsp;uzasadniony interes Administratora,
                    Administrator uwzględni sprzeciw, o&nbsp;ile nie zachodzą po
                    stronie Administratora ważne prawnie uzasadnione podstawy do
                    przetwarzania, nadrzędne wobec interesów, praw
                    i&nbsp;wolności osoby zgłaszającej sprzeciw, lub podstawy do
                    ustalenia, dochodzenia lub obrony roszczeń.
                  </p>
                </li>
                <li>
                  cofnięcia zgody na przetwarzanie danych, bez wpływu na
                  zgodność z&nbsp;prawem przetwarzania, którego dokonano na
                  podstawie zgody przed jej cofnięciem&nbsp;–
                  art.&nbsp;7&nbsp;ust.&nbsp;3&nbsp;RODO;
                </li>
                <li>wniesienia skargi do organu nadzorczego – art. 77 RODO.</li>
              </ul>
            </li>
            <li>
              Jeżeli Administrator nie będzie w&nbsp;stanie ustalić treści
              żądania lub zidentyfikować osoby realizującej ww. uprawnienia
              w&nbsp;oparciu o&nbsp;dokonane zgłoszenie, zwróci się do
              wnioskodawcy o&nbsp;dodatkowe informacje.
            </li>
            <li>
              Odpowiedź na zgłoszenia zostanie udzielona najpóźniej w&nbsp;ciągu
              miesiąca od jego otrzymania. W&nbsp;razie konieczności
              przedłużenia tego terminu, Administrator poinformuje wnioskodawcę
              o&nbsp;przyczynach takiego przedłużenia.
            </li>
          </ol>

          <h2>Artykuł 6. Udostępnianie danych osobowych</h2>
          <ol>
            <li>
              Dane osobowe będą udostępniane jedynie uprawnionym podmiotom, tj.
              upoważnionym pracownikom Administratora oraz innym osobom
              działającym z&nbsp;upoważnienia Administratora, oraz innym
              podmiotom upoważnionym do odbioru danych Użytkownika na podstawie
              odpowiednich przepisów prawa, jak również podmiotom świadczącym
              usługi IT na rzecz Administratora. Dane osobowe Użytkowników mogą
              być przekazywane innym podmiotom – w&nbsp;przypadkach
              niewskazanych przez Administratora bądź przepisy prawa – tylko za
              zgodą Użytkownika.
            </li>
            <li>
              Administrator zobowiązuje się do nieprzekazywania danych osobowych
              Użytkowników do krajów trzecich i&nbsp;organizacji
              międzynarodowych.
            </li>
            <li>
              Administrator zobowiąże wszelkie podmioty, którym powierzy dane
              osobowe Użytkownika, do wdrożenia stosownych zabezpieczeń tych
              danych.
            </li>
          </ol>

          <h2>Artykuł 7. Pliki Cookies</h2>
          <ol>
            <li>
              W&nbsp;serwisie internetowym sociallama.pl („Serwis”) stosuje się
              dane informatyczne przechowywane w&nbsp;urządzeniach końcowych
              użytkowników Serwisu, tj. w&nbsp;szczególności pliki tekstowe,
              zawierające m.in. nazwę strony internetowej, z&nbsp;której
              pochodzą, czas przechowywania ich na urządzeniu końcowym oraz
              unikalny numer („Cookies”).
            </li>
            <li>
              Zgodnie z&nbsp;ustawą z&nbsp;dnia 12 lipca 2024 r. – Prawo
              komunikacji elektronicznej, przechowywanie informacji
              w&nbsp;urządzeniu końcowym Użytkownika oraz uzyskiwanie do nich
              dostępu wymaga jego uprzedniej zgody. Wyjątkiem są wyłącznie te
              pliki Cookies, które są niezbędne do świadczenia usługi żądanej
              przez Użytkownika.
            </li>
            <li>
              Administrator dzieli stosowane pliki Cookies na dwie kategorie:
              {/*
                The `&#32;` after each </strong> is load-bearing — it IS the
                space, written as an entity. SWC trims the leading whitespace of
                a multi-line JSX text child that contains an HTML entity, and
                these sentences carry &nbsp; from the orphan-binding pass, so a
                plain space here compiled away and the page shipped
                "Niezbędne– konieczne". Babel keeps it; this is an SWC
                divergence, and it is why only the Polish copy is affected.
                `{' '}` is not a fix: Biome collapses it straight back into the
                literal space that loses. Same treatment on the <code> below.
              */}
              <ul>
                <li>
                  <strong>Niezbędne</strong>&#32;– konieczne do działania
                  Serwisu i&nbsp;do zapamiętania decyzji Użytkownika
                  w&nbsp;sprawie plików Cookies. Stosowane bez zgody, na
                  podstawie wyjątku, o&nbsp;którym mowa powyżej.
                </li>
                <li>
                  <strong>Analityczne</strong>&#32;– służą do tworzenia
                  zbiorczych statystyk odwiedzin. Stosowane wyłącznie po
                  wyrażeniu zgody przez Użytkownika i&nbsp;wyłącznie do czasu
                  jej cofnięcia.
                </li>
              </ul>
            </li>
          </ol>
          <p>
            Pełny wykaz stosowanych plików Cookies, wraz z&nbsp;podmiotami,
            którym odpowiadające im dane są udostępniane, celem ich stosowania
            oraz okresem przechowywania:
          </p>

          {/* Rendered from lib/content/consent.ts — the same array that drives
              the consent settings panel, so the two cannot drift. */}
          <CookieTable categories={consentCategories} labels={consentTable} />

          <h3>Zgoda i&nbsp;jej cofnięcie</h3>
          <ol>
            <li>
              Przy pierwszej wizycie w&nbsp;Serwisie Użytkownik otrzymuje baner,
              w&nbsp;którym może przyjąć lub odrzucić pliki Cookies inne niż
              niezbędne. Odrzucenie jest równie łatwe jak wyrażenie zgody
              i&nbsp;dostępne w&nbsp;tym samym miejscu. Do czasu dokonania
              wyboru żaden analityczny plik Cookie nie jest zapisywany.
            </li>
            <li>
              Zgodę można cofnąć lub zmienić w&nbsp;każdej chwili, bez podawania
              przyczyny, korzystając z&nbsp;odnośnika „{consentTrigger}”
              w&nbsp;stopce każdej podstrony. Cofnięcie zgody nie wpływa na
              zgodność z&nbsp;prawem przetwarzania, którego dokonano przed jej
              cofnięciem.
            </li>
            <li>
              Decyzja Użytkownika zapisywana jest w&nbsp;pliku Cookie{' '}
              <code>{CONSENT_COOKIE_NAME}</code>&#32;przez 12&nbsp;miesięcy
              –&nbsp;zarówno w&nbsp;przypadku wyrażenia zgody, jak
              i&nbsp;odmowy. Po tym czasie pytanie pojawia się ponownie. Pytanie
              pojawia się ponownie także wtedy, gdy zmieni się lista podmiotów
              wskazanych w&nbsp;tabeli powyżej.
            </li>
          </ol>

          <h3>Statystyki bez plików Cookies</h3>
          <p>
            Serwis korzysta z&nbsp;narzędzia Vercel Web Analytics (Vercel Inc.),
            które nie zapisuje żadnych plików Cookies ani innych danych
            w&nbsp;urządzeniu Użytkownika i&nbsp;niczego z&nbsp;niego nie
            odczytuje. Użytkownicy rozróżniani są wyłącznie na podstawie skrótu
            (hasza) wyliczanego po stronie serwera z&nbsp;danych przychodzącego
            żądania, usuwanego po 24&nbsp;godzinach. Ponieważ narzędzie nie
            sięga do urządzenia końcowego, obowiązek uzyskania zgody,
            o&nbsp;którym mowa w&nbsp;pkt&nbsp;2 niniejszego artykułu, go nie
            dotyczy –&nbsp;działa więc niezależnie od decyzji podjętej
            w&nbsp;banerze. Podstawą przetwarzania jest prawnie uzasadniony
            interes Administratora (art.&nbsp;6 ust.&nbsp;1
            lit.&nbsp;f&nbsp;RODO) polegający na badaniu oglądalności Serwisu.
          </p>

          <h3>Ustawienia przeglądarki</h3>
          <p>
            Niezależnie od powyższego Użytkownik może zarządzać plikami Cookies
            w&nbsp;ustawieniach swojej przeglądarki –&nbsp;usuwać je
            i&nbsp;blokować. Jest to informacja pomocnicza:{' '}
            <strong>
              ustawienia przeglądarki nie stanowią wyrażenia zgody
            </strong>{' '}
            na stosowanie plików Cookies i&nbsp;nie zastępują wyboru dokonanego
            w&nbsp;banerze. Przykładowe opcje edytowania ustawień
            w&nbsp;popularnych przeglądarkach:
          </p>
          <ul className={s.urlList}>
            <li>
              Mozilla Firefox:{' '}
              <Link href="https://support.mozilla.org/pl/kb/ciasteczka">
                https://support.mozilla.org/pl/kb/ciasteczka
              </Link>
            </li>
            <li>
              Edge:{' '}
              <Link href="https://privacy.microsoft.com/pl-pl/windows-10-microsoft-edge-and-privacy">
                https://privacy.microsoft.com/pl-pl/windows-10-microsoft-edge-and-privacy
              </Link>
            </li>
            <li>
              Google Chrome:{' '}
              <Link href="https://support.google.com/chrome/answer/95647?co=GENIE.Platform%3DDesktop&hl=pl">
                https://support.google.com/chrome/answer/95647?co=GENIE.Platform%3DDesktop&hl=pl
              </Link>
            </li>
            <li>
              Opera:{' '}
              <Link href="https://help.opera.com/pl/latest/web-preferences/#cookies">
                https://help.opera.com/pl/latest/web-preferences/#cookies
              </Link>
              .
            </li>
          </ul>
        </div>
      </article>
    </Wrapper>
  )
}
