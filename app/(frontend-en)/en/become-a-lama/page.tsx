import type { Metadata } from 'next'
import s from '@/app/(frontend)/[slug]/post.module.css'
import { Wrapper } from '@/components/layout/wrapper'
import { Link } from '@/components/ui/link'
import { alternatesForPath } from '@/lib/i18n/slug-map'

/*
 * English careers page — EN twin of `/zostan-lama`. Inline copy mirroring the
 * Polish page's pattern (the WP-migrated content is not in the CMS), reusing the
 * post template's long-form article surface. The application form is a mailto
 * CTA, same as the Polish page.
 */

const APPLY_EMAIL = 'halohalo@sociallama.pl'

export const metadata: Metadata = {
  title: 'Become a Lama',
  description:
    'Join the Social Lama herd — current openings in social media and performance marketing. Apply boldly and creatively.',
  alternates: alternatesForPath('/en/become-a-lama'),
}

export default function EnJoinPage() {
  return (
    <Wrapper theme="cream">
      <article className={s.article}>
        <header className={s.header}>
          <h1 className={s.title}>Become a Lama</h1>
          <p className={s.lead}>
            Can you behave yourself in a group? Does anyone even like you on
            Facebook? Do you hold the record for long-distance spitting? …then
            maybe you're a fit. Apply — boldly and creatively:{' '}
            <Link href={`mailto:${APPLY_EMAIL}`}>{APPLY_EMAIL}</Link>
          </p>
        </header>

        <div className={s.body}>
          <h2>Social Media Specialist</h2>
          <p>
            Push the limits of creativity as our Social Media Specialist!
            #createGOODsocial
          </p>

          <h3>We're looking for someone who:</h3>
          <ul>
            <li>
              creates content with passion — the kind that grabs attention
              instantly and sparks interaction
            </li>
            <li>
              moves easily across the whole social media ecosystem and knows how
              to use data to build a content strategy
            </li>
            <li>
              values a workplace where relationships are the main driving force
            </li>
          </ul>

          <h3>As a Social Media Specialist, you'll be responsible for:</h3>
          <ul>
            <li>
              designing and running campaigns that don't just get noticed but
              drive action
            </li>
            <li>
              delivering assigned social media projects in line with the agreed
              strategy
            </li>
            <li>
              staying in touch with clients on day-to-day project delivery
            </li>
            <li>project budgeting</li>
            <li>ongoing analysis of the social media landscape</li>
            <li>reporting and analyzing activity</li>
          </ul>

          <h3>What we expect:</h3>
          <ul>
            <li>at least 2 years of social media experience — a must</li>
            <li>fluency in Reels and Instagram Stories</li>
            <li>a passion for TikTok</li>
            <li>strong communication and a positive attitude</li>
            <li>solid project and time management</li>
            <li>creative and strategic thinking</li>
            <li>a very sharp pen</li>
            <li>
              knowledge of social tools and platforms, their quirks, and how
              they keep changing
            </li>
            <li>a growth mindset</li>
            <li>a good command of English</li>
          </ul>

          <h3>Nice to have:</h3>
          <ul>
            <li>META certifications</li>
          </ul>

          <h3>What we offer:</h3>
          <ul>
            <li>
              a B2B contract in a hybrid setup (2 days remote, 3 in the office)
            </li>
            <li>
              growth — the chance to work in a marketing group with a
              well-established market position — 13 years
            </li>
            <li>
              steady collaboration in a homey atmosphere in Warsaw's Żoliborz
            </li>
            <li>pay that grows with your experience and commitment</li>
            <li>the chance to help build the #GoodPeople community</li>
            <li>creative brainstorms and internal training</li>
            <li>co-financing for external training</li>
            <li>
              a broad benefits package (private healthcare — Medicover or CMP, a
              Multisport card, language-learning support, staff lunch every
              Wednesday, access to a training platform)
            </li>
            <li>Fridays we finish at 3:30 pm (7h)</li>
          </ul>

          <h2>Paid Social Media Specialist</h2>
          <p>
            We're looking for an experienced Paid Social Media Specialist to
            help us grow our campaigns further. If you not only manage campaigns
            effectively but also aren't afraid of innovative solutions and
            always keep the client's success in mind — you're the ideal
            candidate for us!
          </p>

          <h3>Your responsibilities will include:</h3>
          <ul>
            <li>
              running ad campaigns independently across different ad ecosystems
              (TikTok, Facebook, LinkedIn),
            </li>
            <li>
              monitoring campaign performance and spotting areas to improve,
            </li>
            <li>tracking campaign results and preparing reports,</li>
            <li>
              working with social media specialists and clients to keep
              campaigns consistent and effective,
            </li>
            <li>
              actively sharing performance know-how and best practices with the
              team.
            </li>
          </ul>

          <h3>What we expect:</h3>
          <ul>
            <li>at least 2 years of experience in performance marketing,</li>
            <li>experience planning, running, and optimizing campaigns</li>
            <li>
              confidence in the ads managers on Facebook, Instagram, LinkedIn,
              TikTok, Pinterest, and Twitter
            </li>
            <li>experience building reports and proposing new solutions,</li>
            <li>strong analytical and communication skills,</li>
            <li>
              knowledge of ad solutions and social media trends (the FB /
              Twitter / LinkedIn / Snapchat / TikTok / Pinterest ad ecosystem)
            </li>
            <li>
              analytical thinking, data analysis, and drawing conclusions.
            </li>
          </ul>

          <h3>What you get in return:</h3>
          <ul>
            <li>
              a B2B contract in a hybrid setup (2 days remote, 3 in the office)
            </li>
            <li>
              growth — the chance to work in a PR agency with a solid market
              position — 13 years of award-winning work
            </li>
            <li>steady work in a homey atmosphere in Warsaw's Żoliborz</li>
            <li>a salary that grows with your experience and commitment</li>
            <li>
              a clear career path and attractive terms (fixed salary + bonus
              system)
            </li>
            <li>the chance to help build the #GoodPeople community</li>
            <li>creative brainstorms and internal training</li>
            <li>co-financing for external training</li>
            <li>
              a broad benefits package (private healthcare — Medicover or CMP, a
              Multisport card, language-learning support, staff lunch every
              Wednesday, access to a training platform)
            </li>
            <li>Fridays we finish at 3:30 pm (7h)</li>
          </ul>

          <p>
            Apply at <Link href={`mailto:${APPLY_EMAIL}`}>{APPLY_EMAIL}</Link> —
            attach your CV and a few words about yourself.
          </p>
        </div>
      </article>
    </Wrapper>
  )
}
