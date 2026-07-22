import type { Metadata } from 'next'
import { Wrapper } from '@/components/layout/wrapper'
import { Link } from '@/components/ui/link'
import { alternatesForPath } from '@/lib/i18n/slug-map'
import s from '../[slug]/post.module.css'

/*
 * Privacy policy — static page migrated verbatim from the WordPress page
 * `/polityka-prywatnosci/` (migrate-wp-content, page disposition: keep).
 * Reuses the post template's CSS module: same long-form article surface.
 *
 * Content preserved faithfully from the WP original (modified 2024-06-25),
 * including its quirks (restarting list numbering, the osiedle-rozalin.pl
 * reference in Artykuł 7 — an error carried over from the source document,
 * flagged for legal review during migration).
 */

export const metadata: Metadata = {
  title: 'Polityka prywatności',
  description:
    'Polityka prywatności i informacja o sposobie ochrony danych osobowych użytkowników strony sociallama.pl.',
  alternates: alternatesForPath('/polityka-prywatnosci'),
}

export default function PrivacyPolicyPage() {
  return (
    <Wrapper theme="cream">
      <article className={s.article}>
        <header className={s.header}>
          <h1 className={s.title}>Polityka prywatności</h1>
          <p className={s.lead}>
            Polityka prywatności i informacja o sposobie ochrony danych
            osobowych użytkowników strony internetowej.
          </p>
        </header>

        <div className={s.body}>
          <h2>Artykuł 1. Administrator</h2>
          <ol>
            <li>
              Administratorem danych osobowych jest Good One PR sp. z o.o. z
              siedzibą w Warszawie, ul. Edwarda Jelinka 38; 01-646 Warszawa nip:
              525-28953-06; KRS: 0000952410
            </li>
            <li>
              (dalej „<strong>Administrator</strong>”), który przykłada dużą
              wagę do ochrony prywatności i poufności danych osobowych swoich
              Klientów i innych osób fizycznych, których dane są przez
              Administratora przetwarzane (zwanych dalej „
              <strong>Użytkownikami</strong>”).
            </li>
            <li>
              Z Administratorem można kontaktować się pisemnie, kierując
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
              Administrator przetwarza dane osobowe w minimalnym zakresie
              koniecznym do realizacji celów ich przetwarzania, określonych
              jasno niniejszą Polityką Prywatności.
            </li>
            <li>
              Administrator z należytą starannością dobiera i stosuje
              odpowiednie środki techniczne i organizacyjne zapewniające ochronę
              przetwarzanych danych osobowych. Pełen dostęp do baz danych
              posiadają jedynie osoby należycie uprawnione przez Administratora.
            </li>
            <li>
              Administrator zabezpiecza dane osobowe przed ich udostępnieniem
              osobom nieupoważnionym, jak również przed ich przetwarzaniem z
              naruszeniem obowiązujących przepisów prawa. Administrator
              przetwarzając dane osobowe stosuje rozwiązania dostosowane do
              skali i charakteru przetwarzania zapewniając osobom, których dane
              dotyczą, najwyższy stopień ochrony wynikający zarówno ze
              stosowanych rozwiązań technologicznych, jak i organizacyjnych.
            </li>
            <li>
              Przetwarzane będą następujące dane osobowe: imię i nazwisko, adres
              e-mail, nr telefonu.
            </li>
          </ol>

          <h2>Artykuł 3. Podstawa przetwarzania danych osobowych</h2>
          <ol>
            <li>
              Podane przez Użytkownika dane osobowe przetwarzane są zgodnie z
              niniejszą Polityką Prywatności oraz obowiązującymi przepisami
              prawa, w szczególności zgodnie z rozporządzeniem Parlamentu
              Europejskiego i Rady (UE) 2016/679 z 27.04.2016 r. w sprawie
              ochrony osób fizycznych w związku z przetwarzaniem danych
              osobowych i w sprawie swobodnego przepływu takich danych oraz
              uchylenia dyrektywy 95/46/WE z dnia 27 kwietnia 2016 r. („RODO”).
            </li>
            <li>
              Podanie danych osobowych jest dobrowolne, jednakże ich niepodanie
              spowoduje, że zawarcie i realizacja umowy, przesłanie zapytania
              lub wykonanie wnioskowanych czynności będzie niemożliwe.
            </li>
            <li>Podstawą przetwarzania danych osobowych jest:</li>
          </ol>
          <ul>
            <li>
              6 ust. 1 lit. a RODO – w zakresie danych osobowych uzyskanych za
              pomocą zgody, na warunkach określonych w art. 7 RODO;
            </li>
            <li>
              6 ust. 1 lit. b RODO – w zakresie danych podawanych dobrowolnie w
              celu udzielania odpowiedzi na wszelkie skierowane zapytania lub
              wnioski oraz prowadzenie dalszej korespondencji czy kontaktu przed
              zawarciem umowy, jak również przygotowania i realizacji Umowy
              pomiędzy Użytkownikiem a Administratorem lub podmiotem, któremu
              Administrator zleca wykonanie Umowy.
            </li>
          </ul>
          <p>
            Podanie danych jest dobrowolne, jednak niezbędne do realizacji Umowy
            lub prowadzenia korespondencji z Administratorem.
          </p>
          <ul>
            <li>
              6 ust. 1 lit. f RODO – w zakresie danych przetwarzanych w związku
              z realizacją prawnie uzasadnionych celów Administratora.
            </li>
          </ul>
          <ol>
            <li>
              Administrator może przetwarzać dane osób trzecich udostępnione
              przez Użytkowników w celu lub w związku ze świadczeniem usług
              przez Administratora. Użytkownik, przekazując Administratorowi
              dane osób trzecich, każdorazowo oświadcza, że posiada stosowną
              zgodę osób trzecich na przekazanie ich danych Administratorowi.
            </li>
            <li>
              Użytkownik w razie zmiany danych osobowych, o których mowa w
              niniejszej Polityce Prywatności, poinformuje niezwłocznie
              Administratora w celu aktualizacji danych osobowych.
            </li>
            <li>
              Administrator nie stosuje wobec Użytkowników profilowania w
              rozumieniu art. 4 pkt 4) RODO.
            </li>
          </ol>

          <h2>Artykuł 4. Okres przetwarzania danych osobowych</h2>
          <p>
            Dane Użytkownika przechowywane będą nie dłużej niż jest to
            konieczne, tj.:
          </p>
          <ul>
            <li>
              w zakresie prowadzenia korespondencji – dane osobowe będą
              przechowywane przez okres niezbędny do obsługi zapytania, tj.
              okres trwania korespondencji uzasadniony rodzajem zapytania
              (jednak nie dłużej niż przez okres 6 miesięcy od daty zakończenia
              korespondencji).
            </li>
            <li>
              w zakresie wykonania umowy – do czasu zakończenia realizacji
              umowy, a po tym czasie przez okres wymagany przez przepisy prawa
              lub dla realizacji ewentualnych roszczeń, jakie może podnosić
              Administrator i jakie mogą być podnoszone wobec Administratora;
            </li>
            <li>
              w zakresie wypełniania obowiązku prawnego ciążącego na
              Administratorze – do czasu jego wypełnienia;
            </li>
            <li>
              w zakresie realizacji prawnie uzasadnionych interesów przez
              Administratora lub przez stronę trzecią – do czasu ich realizacji
              lub do czasu wniesienia przez Użytkownika sprzeciwu wobec
              przetwarzania danych osobowych, o ile nie występują uzasadnione
              podstawy dalszego przetwarzania;
            </li>
            <li>
              w zakresie przetwarzania realizowanego wyłącznie w oparciu o zgodę
              – do czasu niezwłocznego usunięcia danych, zrealizowanego w
              oparciu o zgłoszone przez Użytkownika żądanie.
            </li>
          </ul>

          <h2>Artykuł 5. Prawa Użytkownika</h2>
          <ol>
            <li>
              W związku z przetwarzaniem danych osobowych przez Administratora,
              Użytkownik ma prawo do:
            </li>
            <li>żądania dostępu do danych osobowych – art. 15;</li>
          </ol>
          <p>
            Na żądanie Użytkownika dotyczące dostępu do jego danych
            Administrator informuje Użytkownika, czy przetwarza jego dane, oraz
            informuje Użytkownika o szczegółach przetwarzania zgodnie z RODO, a
            także udziela Użytkownikowi dostępu do danych go dotyczących. Dostęp
            do danych będzie zrealizowany przez przesłanie kopii danych drogą
            elektroniczną. W przypadku żądania dostarczenia kolejnej kopii
            danych w formie papierowej Administrator ma prawo obciążyć
            Użytkownika kosztami związanymi z ich przygotowaniem w takiej formie
            i wysłaniem zgodnie z art. 15 ust. 3 RODO.
          </p>
          <ol>
            <li>prawo do sprostowania danych osobowych – 16 RODO;</li>
          </ol>
          <p>
            Administrator dokonuje sprostowania nieprawidłowych danych na
            żądanie Użytkownika.
          </p>
          <ol>
            <li>prawo do żądania usunięcia danych osobowych – art. 17 RODO;</li>
          </ol>
          <p>
            Prawo to obowiązuje w zakresie, w jakim usunięcie danych nie stoi w
            sprzeczności z obowiązującymi Administratora przepisami,
          </p>
          <ol>
            <li>prawo do ograniczenia przetwarzania danych – art. 18 RODO;</li>
          </ol>
          <p>
            Prawo to obowiązuje w zakresie, w jakim Administrator może
            ograniczyć przetwarzanie danych osobowych w kontekście
            obowiązujących go przepisów oraz w jakim nie narusza to prawa
            Administratora do dochodzenia swoich roszczeń od Użytkownika.
          </p>
          <ol>
            <li>przenoszenia danych – art. 20 RODO;</li>
          </ol>
          <p>
            Na żądanie Użytkownika Administrator wydaje w ustrukturyzowanym,
            powszechnie używanym formacie nadającym się do odczytu maszynowego
            lub przekazuje innemu podmiotowi, jeśli jest to możliwe, dane
            dotyczące Użytkownika, który dostarczył je w celu zawarcia lub
            wykonania Umowy lub które przetwarzane są na podstawie zgody.
          </p>
          <ol>
            <li>wniesienia sprzeciwu wobec przetwarzania – art. 21 RODO;</li>
          </ol>
          <p>
            Jeżeli Użytkownik zgłosi umotywowany jego szczególną sytuacją
            sprzeciw względem przetwarzania jego danych a dane są przetwarzane
            przez Administratora w oparciu o uzasadniony interes Administratora,
            Administrator uwzględni sprzeciw, o ile nie zachodzą po stronie
            Administratora ważne prawnie uzasadnione podstawy do przetwarzania,
            nadrzędne wobec interesów, praw i wolności osoby zgłaszającej
            sprzeciw, lub podstawy do ustalenia, dochodzenia lub obrony
            roszczeń.
          </p>
          <ol>
            <li>
              cofnięcia zgody na przewarzanie danych, bez wpływu na zgodność z
              prawem przetwarzania, którego dokonano na postawie zgody przed jej
              cofnięciem – art. 7 ust. 3 RODO;
            </li>
            <li>wniesienia skargi do organu nadzorczego – art. 77 RODO.</li>
            <li>
              Jeżeli Administrator nie będzie w stanie ustalić treści żądania
              lub zidentyfikować osoby realizującej ww. uprawnienia w oparciu o
              dokonane zgłoszenie, zwróci się do wnioskodawcy o dodatkowe
              informacje.
            </li>
            <li>
              Odpowiedź na zgłoszenia zostanie udzielona najpóźniej w ciągu
              miesiąca od jego otrzymania. W razie konieczności przedłużenia
              tego terminu, Administrator poinformuje wnioskodawcę o przyczynach
              takiego przedłużenia.
            </li>
          </ol>

          <h2>Artykuł 6. Udostępnianie danych osobowych</h2>
          <ol>
            <li>
              Dane osobowe będą udostępniane jedynie uprawnionym podmiotom, tj.
              upoważnionym pracownikom Administratora oraz innym osobom
              działającym z upoważnienia Administratora, oraz innym podmiotom
              upoważnionym do odbioru danych Użytkownika na podstawie
              odpowiednich przepisów prawa, jak również podmiotom świadczącym
              usługi na rzecz Administratora usług IT. Dane osobowe Użytkowników
              mogą być przekazywane innym podmiotom – w przypadkach
              niewskazanych przez Administratora bądź przepisy prawa – tylko za
              zgodą Użytkownika.
            </li>
            <li>
              Administrator zobowiązuje się do nieprzekazywania danych osobowych
              Użytkowników do krajów trzecich i organizacji międzynarodowych.
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
              W serwisie internetowym www.osiedle-rozalin.pl („Serwis”) stosuje
              się dane informatyczne przechowywane w urządzeniach końcowych
              użytkowników Serwisu, tj. w szczególności pliki tekstowe,
              zawierające m.in. nazwę strony internetowej, z której pochodzą,
              czas przechowywania ich na urządzeniu końcowym oraz unikalny numer
              („Cookies”).
            </li>
            <li>
              Na podstawie art. 173 ust. 1 ustawy Prawo telekomunikacyjne z dnia
              16 lipca 2004 r. (Dz. U. z 2021 r. poz. 576) Administrator
              niniejszym informuje, że:
            </li>
            <li>
              pliki Cookies są stosowane w Serwisie w celu ułatwienia
              korzystania z Serwisu, pozwalają dostosowywać treści dostępne w
              Serwisie do indywidualnych potrzeb i preferencji użytkowników
              Serwisu, jak również służą do opracowywania ogólnych statystyk
              dotyczących korzystania z Serwisu.
            </li>
            <li>
              dane osobowe gromadzone przy użyciu plików Cookies są zbierane
              wyłącznie w celu wykonywania określonych funkcji na rzecz
              użytkowników i są zaszyfrowane w sposób uniemożliwiający dostęp do
              nich osobom nieuprawnionym.
            </li>
            <li>
              użytkownik Serwisu ma możliwość wyrażenia zgody na stosowanie
              Cookies poprzez dokonanie odpowiednich ustawień w swojej
              przeglądarce internetowej (w szczególności umożliwienie lub
              zablokowanie stosowania plików „cookies”).
            </li>
            <li>
              użytkownik Serwisu może dokonać w każdym czasie zmiany ustawień
              dotyczących Cookies – szczegółowe informacje o możliwości i
              sposobach obsługi plików Cookies dostępne są w ustawieniach
              oprogramowania (przeglądarki internetowej). Przykładowe opcje
              edytowania ustawień w popularnych przeglądarkach:
            </li>
          </ol>
          <ul>
            <li>
              Mozilla FireFox:{' '}
              <Link href="https://support.mozilla.org/pl/kb/ciasteczka">
                https://support.mozilla.org/pl/kb/ciasteczka
              </Link>
            </li>
            <li>
              Internet Explorer:{' '}
              <Link href="http://www.support.microsoft.com/kb/278835/pl">
                http://www.support.microsoft.com/kb/278835/pl
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
