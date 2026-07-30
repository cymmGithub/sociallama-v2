import type { Metadata } from 'next'
import { Wrapper } from '@/components/layout/wrapper'
import { Link } from '@/components/ui/link'
import { alternatesForPath } from '@/lib/i18n/slug-map'
import s from '../[slug]/post.module.css'

/*
 * Careers page — content migrated from the WordPress page `/zostan-lama/`
 * (migrate-wp-content, page disposition: keep). Reuses the post template's
 * CSS module: same long-form article surface.
 *
 * The WP page's Contact Form 7 application form has no v2 backend; it is
 * replaced with a mailto CTA to the site's contact address.
 */

const APPLY_EMAIL = 'halohalo@sociallama.pl'

export const metadata: Metadata = {
  title: 'Zostań lamą',
  description:
    'Dołącz do stada Social Lama — aktualne oferty pracy w social media i performance marketingu. Aplikuj śmiało i kreatywnie.',
  alternates: alternatesForPath('/zostan-lama'),
}

export default function JoinPage() {
  return (
    <Wrapper theme="cream">
      <article className={s.article}>
        <header className={s.header}>
          <h1 className={s.title}>Zostań lamą</h1>
          <p className={s.lead}>
            Umiesz się zachować w&nbsp;grupie? Lubi Cię ktoś w&nbsp;ogóle na
            fejsie? Bijesz rekordy w&nbsp;pluciu na odległość? …to może do nas
            pasujesz. Aplikuj śmiało i&nbsp;kreatywnie:{' '}
            <Link href={`mailto:${APPLY_EMAIL}`}>{APPLY_EMAIL}</Link>
          </p>
        </header>

        <div className={s.body}>
          <h2>Social Media Specialist</h2>
          <p>
            Przekraczaj granice twórczości jako nasz Social Media Specialist!
            #createGOODsocial
          </p>

          <h3>Poszukujemy osoby, która:</h3>
          <ul>
            <li>
              z&nbsp;pasją tworzy treści, które natychmiast przyciągają uwagę
              i&nbsp;prowokują do interakcji
            </li>
            <li>
              z&nbsp;łatwością porusza się po ekosystemie wszystkich mediów
              społecznościowych i&nbsp;potrafi efektywnie wykorzystywać dane do
              tworzenia strategii contentowej
            </li>
            <li>
              ceni sobie miejsce pracy, gdzie relacje są głównym motorem
              napędowym
            </li>
          </ul>

          <h3>Jako Social Media Specialist będziesz odpowiedzialny/a za:</h3>
          <ul>
            <li>
              projektowanie i&nbsp;wdrażanie kampanii, które nie tylko zwracają
              uwagę, ale też skłaniają do działania
            </li>
            <li>
              realizację powierzonych projektów SM zgodnie z&nbsp;ustaloną
              strategią
            </li>
            <li>
              kontakt z&nbsp;klientami w&nbsp;zakresie bieżącej realizacji
              projektów
            </li>
            <li>budżetowanie projektów</li>
            <li>bieżącą analizę otoczenia SM</li>
            <li>raportowanie i analizę działań</li>
          </ul>

          <h3>Oczekujemy:</h3>
          <ul>
            <li>minimum 2 lata doświadczenia w&nbsp;SM – warunek konieczny</li>
            <li>biegłości w&nbsp;formatach: Reels i&nbsp;InstaStories</li>
            <li>pasji do TikToka</li>
            <li>komunikatywności i pozytywnego nastawienia</li>
            <li>umiejętności zarządzania projektami i czasem</li>
            <li>kreatywnego i strategicznego myślenia</li>
            <li>bardzo dobrego pióra</li>
            <li>
              znajomości narzędzi i&nbsp;platform społecznościowych, ich
              charakterystyki, zachodzących zmian itp.
            </li>
            <li>nastawienia na rozwój</li>
            <li>znajomości języka angielskiego</li>
          </ul>

          <h3>Mile widziane:</h3>
          <ul>
            <li>certyfikaty META</li>
          </ul>

          <h3>Oferujemy:</h3>
          <ul>
            <li>
              współpracę w&nbsp;oparciu o&nbsp;umowę B2B w&nbsp;trybie
              hybrydowym (2&nbsp;dni zdalne, 3&nbsp;dni w&nbsp;biurze)
            </li>
            <li>
              rozwój – możliwość pracy w&nbsp;grupie marketingowej
              z&nbsp;ugruntowaną pozycją na rynku – 13 lat
            </li>
            <li>
              stabilną współpracę w&nbsp;domowej atmosferze na warszawskim
              Żoliborzu
            </li>
            <li>
              wynagrodzenie rosnące wraz z&nbsp;Twoim doświadczeniem
              i&nbsp;zaangażowaniem
            </li>
            <li>możliwość współtworzenia społeczności #GoodPeople</li>
            <li>
              udział w&nbsp;brainstormach kreatywnych i&nbsp;szkoleniach
              wewnętrznych
            </li>
            <li>dofinansowanie do szkoleń zewnętrznych</li>
            <li>
              szeroki pakiet benefitów (prywatna opieka medyczna do wyboru
              Medicover lub CMP, karta Multisport, dofinansowanie nauki języków
              obcych, lunch dla pracowników w&nbsp;każdą środę, dostęp do
              platformy szkoleniowej)
            </li>
            <li>w&nbsp;piątki praca do 15:30 (7h)</li>
          </ul>

          <h2>Paid Social Media Specialist</h2>
          <p>
            Poszukujemy doświadczonego Paid Social Media Specjalisty, który
            pomoże nam w&nbsp;dalszym rozwoju naszych kampanii. Jeżeli jesteś
            osobą, która nie tylko efektywnie zarządza kampaniami, ale również
            nie boi się innowacyjnych rozwiązań i&nbsp;zawsze ma na uwadze
            sukces klienta, to jesteś kandydatem idealnym dla nas!
          </p>

          <h3>Do Twoich obowiązków będzie należało:</h3>
          <ul>
            <li>
              samodzielna realizacja kampanii reklamowych w&nbsp;różnych
              ekosystemach reklamowych (TikTok, Facebook, LinkedIn),
            </li>
            <li>
              monitorowanie wydajności kampanii i&nbsp;identyfikacja obszarów
              wymagających poprawy,
            </li>
            <li>śledzenie wyników kampanii i&nbsp;przygotowywanie raportów,</li>
            <li>
              współpraca ze specjalistami social media i&nbsp;klientami
              w&nbsp;celu zapewnienia spójności i&nbsp;skuteczności kampanii
              marketingowych,
            </li>
            <li>
              aktywne dzielenie się wiedzą i&nbsp;najlepszymi praktykami
              w&nbsp;obszarze performance w&nbsp;zespole.
            </li>
          </ul>

          <h3>Oczekujemy:</h3>
          <ul>
            <li>
              minimum 2 lata doświadczenia zdobytego w&nbsp;obszarze performance
              marketingu,
            </li>
            <li>
              doświadczenia w&nbsp;planowaniu, realizacji i&nbsp;optymalizacji
              kampanii
            </li>
            <li>
              znajomości i&nbsp;biegłości w&nbsp;obsłudze managera reklam na
              platformach: Facebook, Instagram, LinkedIn, TikTok, Pinterest,
              Twitter
            </li>
            <li>
              doświadczenia przy opracowywaniu raportów i&nbsp;proponowaniu
              nowych rozwiązań,
            </li>
            <li>
              wysoko rozwiniętych umiejętności analitycznych
              i&nbsp;komunikacyjnych,
            </li>
            <li>
              znajomości rozwiązań reklamowych i&nbsp;trendów w&nbsp;social
              media (ekosystem reklamowy FB / Twitter / LinkedIn / Snapchat /
              TikTok / Pinterest)
            </li>
            <li>
              umiejętności analitycznego myślenia, analizy danych oraz
              wyciągania wniosków.
            </li>
          </ul>

          <h3>Co dajemy w zamian:</h3>
          <ul>
            <li>
              zatrudnienie w&nbsp;oparciu o&nbsp;umowę B2B w&nbsp;trybie
              hybrydowym (2&nbsp;dni zdalne, 3&nbsp;dni w&nbsp;biurze)
            </li>
            <li>
              rozwój – możliwość pracy w&nbsp;agencji PR z&nbsp;ugruntowaną
              pozycją na rynku – 13 lat działalności wyróżnionej nagrodami
              branżowymi
            </li>
            <li>
              stabilną pracę w&nbsp;domowej atmosferze na warszawskim Żoliborzu
            </li>
            <li>
              pensję rosnącą wraz z&nbsp;Twoim doświadczeniem
              i&nbsp;zaangażowaniem
            </li>
            <li>
              jasną ścieżkę kariery i&nbsp;atrakcyjne warunki zatrudnienia
              (stała pensja + system premiowy)
            </li>
            <li>możliwość współtworzenia społeczności #GoodPeople</li>
            <li>
              udział w&nbsp;brainstormach kreatywnych i&nbsp;szkoleniach
              wewnętrznych
            </li>
            <li>dofinansowanie do szkoleń zewnętrznych</li>
            <li>
              szeroki pakiet benefitów (prywatna opieka medyczna do wyboru
              Medicover lub CMP, karta Multisport, dofinansowanie nauki języków
              obcych, lunch dla pracowników w&nbsp;każdą środę, dostęp do
              platformy szkoleniowej)
            </li>
            <li>w&nbsp;piątki praca do 15:30 (7h)</li>
          </ul>

          <p>
            Aplikuj na <Link href={`mailto:${APPLY_EMAIL}`}>{APPLY_EMAIL}</Link>{' '}
            — dołącz CV i&nbsp;kilka zdań o&nbsp;sobie.
          </p>
        </div>
      </article>
    </Wrapper>
  )
}
