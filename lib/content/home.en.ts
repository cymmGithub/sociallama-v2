/**
 * English homepage + chrome content — the EN twin of `home.ts`.
 *
 * Each block `satisfies LocalizedHome['<key>']`, so a missing or mis-shaped
 * translation fails the build (design D2). Structural notes mirror the Polish
 * module; only strings and hrefs differ. `socials` is locale-independent (real
 * profile URLs) and lives in `socials.ts` — neither locale module owns it.
 *
 * Voice: playful but clean, American spelling (user-approved 2026-07-22).
 */
import { industryNav } from '@/lib/content/branze.en'
import type { LocalizedHome } from '@/lib/content/home'

// —— Chrome: top bar ————————————————————————————————————————————————————————

export const nav = {
  logoAlt: 'Social Lama',
  cta: {
    label: "LET'S TALK ABOUT YOUR BUSINESS",
    labelShort: "LET'S TALK",
    href: '/en/contact',
  },
  menuLabel: 'Menu',
  menuOpenLabel: 'Open menu',
  menuCloseLabel: 'Close menu',
  menuDialogLabel: 'Menu',
  navLabel: 'Main navigation',
} satisfies LocalizedHome['nav']

// —— Chrome: overlay menu ——————————————————————————————————————————————————
// Industry/service subpages don't exist yet (they 404 in PL too) — the EN links
// point at their eventual translated-slug URLs (user decision: translated slugs
// under /en).

// EN counterpart of MOBILE_BRANZE_SLUGS (home.ts) — EN industry slugs differ
// from PL, so the core set is declared per locale.
const MOBILE_INDUSTRY_SLUGS = new Set([
  'automotive',
  'electronics',
  'beauty',
  'fashion',
  'health',
])

export const menu = {
  columns: [
    {
      // Derived from the canonical industry module (design D3).
      label: 'INDUSTRIES',
      items: industryNav.map((item) =>
        MOBILE_INDUSTRY_SLUGS.has(item.href.split('/').pop() ?? '')
          ? item
          : { ...item, mobileHidden: true }
      ),
      more: { label: 'All industries', href: '/en/industries' },
    },
    {
      label: 'SERVICES',
      items: [
        { label: 'Strategy', href: '/en/services/strategy', mobileHidden: true },
        { label: 'Content', href: '/en/services/content' },
        { label: 'Sales', href: '/en/services/sales' },
        {
          label: 'Ad Campaigns',
          href: '/en/services/ad-campaigns',
          mobileHidden: true,
        },
        { label: 'Creative & Video', href: '/en/services/creative-video' },
        {
          label: 'Audit & Consulting',
          href: '/en/services/audit-consulting',
          mobileHidden: true,
        },
        {
          label: 'Influencer Marketing',
          href: '/en/services/influencer-marketing',
          mobileHidden: true,
        },
        // { label: 'Training & Courses', href: '/en/training', mobileHidden: true }, // delayed launch — no page yet, keep out of nav
      ],
      more: { label: 'All services', href: '/en/services' },
    },
  ],
  utility: [
    { label: 'ABOUT US', href: '/en/about-us' },
    { label: 'BLOG', href: '/en/blog' },
    { label: 'CASE STUDIES', href: '/en/case-studies' },
    { label: 'BECOME A LAMA', href: '/en/become-a-lama' },
    { label: 'halohalo@sociallama.pl', href: 'mailto:halohalo@sociallama.pl' },
  ],
} satisfies LocalizedHome['menu']

// —— Hero ——————————————————————————————————————————————————————————————————

export const hero = {
  headline: {
    // Five tokens: CREATIVE + VIDEO merged, parity with PL "Kreacje & Wideo".
    // Order mirrors the outfit stack (hero-outfit-swap), same as PL.
    rotator: [
      'CREATIVE & VIDEO',
      'SOCIAL MEDIA',
      'CONTENT',
      'SALES',
      'STRATEGY',
    ],
    lines: ['THAT WORKS', 'WITH SOCIAL LAMA'],
  },
  llamaAlt: 'A llama in sunglasses — the Social Lama mascot',
} satisfies LocalizedHome['hero']

// —— Clients ————————————————————————————————————————————————————————————————

export const clientsHeading =
  'TRUSTED BY' satisfies LocalizedHome['clientsHeading']

export const clientCardCta = {
  label: 'Case study',
} satisfies LocalizedHome['clientCardCta']

// English belt copy. Same keys as the Polish set — `LocalizedHome['clients']`
// makes a missing brand a build error rather than a blank card. Figures are
// authored for the English reader rather than translated line-for-line: compact
// M/k forms and comma grouping, matching the numbers elsewhere in this locale.
export const clients = {
  asus: {
    numbers:
      '26,000,000 Facebook likes and 44 pieces on ASUS AI features in six weeks.',
    metrics: [
      { label: 'AI films · YouTube', value: '4' },
      { label: 'Reels with @technokrata', value: '5' },
      { label: 'Posts & animations · Facebook', value: '22' },
    ],
  },
  // See the note in home.ts — the sentence carries the two headline monthly
  // averages, the rows keep the reach and engagement behind them.
  belvedere: {
    numbers:
      'An average of 75,718 monthly views and a 92% recommendation rate on Facebook.',
    metrics: [
      { label: 'Reach / mo', value: '28,959' },
      { label: 'Engaged accounts / mo', value: '1,530' },
      { label: 'Reviews · Facebook', value: '612' },
    ],
  },
  engie: {
    numbers: '264k LinkedIn post impressions and 1,248 new followers.',
    metrics: [
      { label: 'Reactions · LinkedIn', value: '5,375' },
      { label: 'Impressions · Facebook', value: '69.1k' },
      { label: 'Interactions · Facebook', value: '917' },
    ],
  },
  'fm-logistics': {
    numbers:
      'Over 800k LinkedIn post impressions and 2,111 new followers, all organic.',
    metrics: [
      { label: 'Community · LinkedIn', value: '6,894 → 9,005' },
      { label: 'Reactions · LinkedIn', value: '+10.7k' },
      { label: 'Video plays · LinkedIn', value: '317,000' },
    ],
  },
  imid: {
    numbers: '825k Facebook impressions and Instagram views up 5,845%.',
    metrics: [
      { label: 'Interaction growth · Instagram', value: '+116,200%' },
      { label: 'Interaction growth · Facebook', value: '+159%' },
      { label: 'New group members', value: '+273' },
    ],
  },
  irobot: {
    testimonial: {
      quote:
        "For nearly two years we've worked with Social Lama on TikTok and YouTube, and we can wholeheartedly recommend them.",
      author: 'Małgorzata Radomska',
      company: 'iRobot Polska',
      image: '/assets/testimonial-radomska.jpg',
    },
  },
  'julius-meinl': {
    numbers: '433k Facebook impressions — a 1,380% jump.',
    metrics: [
      { label: 'Impressions · LinkedIn', value: '413,408' },
      { label: 'Interactions · Facebook', value: '4,806' },
      { label: 'Reach · Instagram', value: '24,179' },
    ],
  },
  'jw-construction': {
    numbers: '27k organic LinkedIn impressions and 819 reactions.',
    metrics: [
      { label: 'New followers · LinkedIn', value: '186' },
    ],
  },
  polomarket: {
    numbers: '30M video views across the campaign and 128k TikTok likes.',
    metrics: [
      { label: 'Fans · Facebook', value: '158,706' },
      { label: 'Reactions · Facebook', value: '46,370' },
      { label: 'Comments · TikTok', value: '2,709' },
    ],
  },
  'pracuj-pl': {
    numbers: '95.4M TikTok views and 52.6k followers.',
    metrics: [
      { label: 'Viewers · TikTok', value: '94.8M' },
      { label: 'Likes · TikTok', value: '104.8k' },
    ],
  },
  'produkty-cukiernicze-brzesc': {
    numbers: 'Exports up tenfold and daily Facebook reach up 50%.',
    metrics: [
      { label: 'Organic reach · Facebook', value: '+52.8%' },
      { label: 'Post reach · Facebook', value: '368 → 549' },
    ],
  },
  rabkoland: {
    numbers: 'Nearly 3M YouTube views for one episode filmed at Rabkoland.',
    metrics: [
      { label: 'Reach growth · Instagram', value: '+38%' },
    ],
  },
  riviera: {
    numbers:
      '306% of the annual reach KPI on TikTok, and over 3M people reached.',
    metrics: [
      { label: 'Reach · Instagram', value: '163% of KPI' },
      { label: 'New followers · Facebook', value: '160% of KPI' },
      { label: 'Cost per fan · Facebook', value: '−400%' },
    ],
  },
  skrzat: {
    numbers: "35M TikTok views for the film's release.",
    metrics: [
      { label: 'Likes · TikTok', value: '100k' },
      { label: 'Views · Instagram', value: '4.38M' },
      { label: 'Views · Facebook', value: '3.46M' },
    ],
  },
  vistula: {
    numbers:
      'Almost 3.9M more Instagram profile views and 1,615 new followers.',
    metrics: [
      { label: 'New followers · Facebook', value: '+794' },
      { label: 'Impression growth · Facebook', value: '+142,534' },
      { label: 'Impression growth · Instagram', value: '+93,937' },
    ],
  },
  volvo: {
    numbers: 'Over 2,000 new Facebook followers across both Volvo showrooms.',
    metrics: [
      { label: 'Volvo Car Warszawa', value: '+184' },
      { label: 'Dom Volvo', value: '+97' },
    ],
  },
} satisfies LocalizedHome['clients']

// —— Why that works ————————————————————————————————————————————————————————

export const whyThatWorks = {
  heading: ['WHY', 'THAT WORKS'],
  manifesto: {
    strong:
      'Because we know our stuff. We handle brands end-to-end across social media,',
    muted:
      'designing communication strategies tailored to what each business actually needs.',
  },
  support: {
    strong:
      "Run standout communication with us, build an engaged community, and grow your business on social media. With us in your corner you'll hit those goals faster than you'd think!",
    muted:
      'We look after your brand at every stage — from the first audit, through content creation, to the final reports on the wins we rack up together.',
  },
  link: { label: 'DISCOVER OUR EXPERIENCE', href: '/en/case-studies' },
  memberLink: { label: 'More', hrefBase: '/en/about-us' },
  moreCard: { label: 'Learn more', anchor: '#o-lamie' },
  teamLabel: 'Social Lama team',
  certsLabel:
    'DIMAQ Professional and Meta Small Business Academy — certified skills in digital marketing and advertising across the Meta ecosystem.',
  certAlt: {
    dimaq: 'DIMAQ professional certificate',
    meta: 'Meta Small Business Academy certificate',
  },
} satisfies LocalizedHome['whyThatWorks']

// —— Services ————————————————————————————————————————————————————————————————
// `id` values are shared across locales (they key the stage machinery) — do NOT
// translate them. Only display strings and hrefs change.

export const services = {
  eyebrow: 'WHAT DOES SOCIAL LAMA DO?',
  heading: 'Services',
  linkLabel: 'LEARN MORE',
  playLabel: 'Play',
  items: [
    {
      id: 'content',
      title: 'CONTENT',
      body: 'Strategy is our starting point: we get to know your brand and your audience so we can build communication that works on social media.',
      bodyLong:
        "Strategy is our starting point: we get to know your needs and capabilities, your target audience, and your brand's values and character so we can build effective communication on social media. From there we set measurable goals, pick the right tools, monitor as we go, deliver the plan consistently, and report the results on a regular basis.",
      link: { label: 'LEARN MORE', href: '/en/services/content' },
      stage: {
        kind: 'panels',
        panels: [
          {
            src: '/assets/content-burger-king.jpg',
            alt: 'Burger King “Medal-worthy” creative — fries against snowy mountain peaks',
            width: 1081,
            height: 1351,
          },
          {
            src: '/assets/content-dpd.jpg',
            alt: 'Social Lama × DPD creative — a llama holding a parcel in Andean scenery',
            width: 1080,
            height: 1350,
          },
          {
            src: '/assets/content-breville.jpg',
            alt: 'Breville creative “What coffee would the Grinch drink?” — a green cup in a Grinch hat',
            width: 1080,
            height: 1350,
          },
          {
            src: '/assets/content-walentynki.jpg',
            alt: 'Valentine’s creative for pracuj.pl, iRobot and Vobis — a lovestruck llama captioned “Not just a passing crush”',
            width: 1080,
            height: 1350,
          },
          {
            src: '/assets/content-laurastar.jpg',
            alt: 'Laurastar creative “An assistant you can rely on” — the steamer next to a red stiletto',
            width: 1080,
            height: 1350,
          },
          {
            src: '/assets/content-easy-egg.jpg',
            alt: 'Easy Egg creative — a toast racket serving an egg, captioned “Every big day starts with breakfast”',
            width: 1081,
            height: 1351,
          },
          {
            src: '/assets/content-kohersen.jpg',
            alt: 'Kohersen creative “My name is gaaa…” — the Black Cube pot on a concert stage',
            width: 576,
            height: 720,
          },
        ],
      },
    },
    {
      id: 'sprzedaz',
      title: 'SALES',
      body: 'Communication has to do its most important job: selling — and we measure success by your business results.',
      bodyLong:
        "As we shape your brand's offer, we make sure communication ultimately does its most important job: selling products or services. We measure our effectiveness not only by social media metrics, but above all by your business's success.",
      link: { label: 'LEARN MORE', href: '/en/services/sales' },
      stage: {
        kind: 'panels',
        panels: [
          {
            src: '/assets/sprzedaz-meta-ads.png',
            alt: 'Meta Ads Manager — sales campaign results on an iPad',
            width: 1350,
            height: 1080,
          },
          {
            src: '/assets/sprzedaz-x.png',
            alt: 'X analytics — growth in views and engagement on a MacBook',
            width: 1350,
            height: 1080,
          },
          {
            src: '/assets/sprzedaz-tiktok.png',
            alt: 'TikTok Studio — views and followers stats on a MacBook',
            width: 1350,
            height: 1080,
          },
          {
            src: '/assets/sprzedaz-youtube.png',
            alt: 'YouTube channel stats — growth in views on an iPad',
            width: 1350,
            height: 1080,
          },
          {
            src: '/assets/sprzedaz-linkedin.png',
            alt: 'LinkedIn page analytics — growth in visits and followers on a MacBook',
            width: 1350,
            height: 1080,
          },
          {
            src: '/assets/sprzedaz-instagram.png',
            alt: 'Instagram insights — growth in reach and followers on an iPhone',
            width: 900,
            height: 1117,
          },
        ],
      },
    },
    {
      id: 'kreacje',
      title: 'CREATIVE & VIDEO',
      body: 'Graphics, video, reels, and animation — the full spectrum of creative, tuned to the trends and to what your audience loves.',
      bodyLong:
        'Graphics, video, carousels, infographics, reels, animations, visualizations — deep video and copywriting firepower lets us offer the full spectrum of social media creative. Our strategies keep the messaging varied and tuned to trends and audience preferences.',
      link: { label: 'LEARN MORE', href: '/en/services/creative-video' },
      dwellMs: 11000,
      stage: {
        kind: 'video',
        clips: [
          {
            src: '/clips/kreacje-bts.mp4',
            poster: '/clips/kreacje-bts-poster.jpg',
            alt: 'Behind the scenes of a Burger King shoot',
          },
          {
            src: '/clips/kreacje-dpd.mp4',
            poster: '/clips/kreacje-dpd-poster.jpg',
            alt: 'Coverage of a DPD event',
          },
          {
            src: '/clips/kreacje-volvo.mp4',
            poster: '/clips/kreacje-volvo-poster.jpg',
            alt: 'Coverage of the Dom Volvo event',
          },
          {
            src: '/clips/kreacje-pracuj.mp4',
            poster: '/clips/kreacje-pracuj-poster.jpg',
            alt: 'Ad spot for the pracuj.pl app',
          },
        ],
      },
    },
  ],
} satisfies LocalizedHome['services']

// —— How it works ——————————————————————————————————————————————————————————

export const howItWorks = {
  heading: ['HOW', 'IT WORKS'],
  subhead: "WHAT'S IT LIKE WORKING WITH SOCIAL LAMA?",
  ariaLabel: 'How it works',
  railLabel: 'Process',
  railAriaLabel: 'Steps of the engagement',
  proofLabel: "Here's how it looked at",
  caseStudyCta: 'See the case study',
  steps: [
    {
      number: '01',
      title: 'A strategy workshop with you',
      text: 'Together we analyze your business needs, goals, challenges, and opportunities.',
      image: '/assets/step-1.png',
      proof: {
        // Mirrors PL 01: no headline, and the colon hands off to the figure row
        // rather than the prose restating the same two numbers.
        say: [
          "We started by analyzing the previous communication and setting the direction. The baseline was 1,168 followers, and after seventeen months of working together, here's where things stand:",
        ],
        stats: [
          { figure: '+5,054', label: 'followers' },
          { figure: '+57,911', label: 'likes' },
          { figure: '17', label: 'months' },
        ],
        client: 'irobot',
        href: 'irobot#wyzwanie',
      },
    },
    {
      number: '02',
      title: 'Communication strategy and content creation',
      text: 'We turn what we agreed on into an action plan — a communication strategy — and then deliver on it.',
      image: '/assets/step-2.png',
      proof: {
        title: 'One partnership, two profiles, and an individual approach to each',
        say: [
          'For each of the VOLVO dealerships we built a separate communication direction, tailored to its specifics, its audience, and the character of Facebook, Instagram, and LinkedIn.',
        ],
        stats: [
          { figure: '2', label: 'dealerships' },
          { figure: '3', label: 'platforms' },
          { figure: '6', label: 'strategies' },
        ],
        client: 'volvo',
        href: 'volvo#podejscie',
      },
    },
    {
      number: '03',
      title: 'Results analysis',
      text: 'We analyze the results and recommend the changes that are needed.',
      image: '/assets/step-4.png',
      proof: {
        title: 'Analyzing the results is what made the work more effective',
        say: [
          'Regular monitoring showed us what needed optimizing, and the changes translated into serious channel growth. Before we started, the channel gained a few hundred new subscribers a year — in our first year, that grew nearly ',
          { figure: '20-fold' },
          '.',
        ],
        stats: [
          { figure: '~20×', label: 'more subscribers' },
          { figure: '1', label: 'year in our care' },
        ],
        client: 'irobot',
        href: 'irobot#wyniki',
      },
    },
    {
      number: '04',
      title: 'Reporting',
      text: 'We prepare monthly, semi-annual, and annual reports.',
      image: '/assets/step-5.png',
      // No link: this step addresses the reader rather than a case, so it has
      // no call to action (decision, 2026-07-28).
      proof: {
        title: 'Everything here is a real number from a real report',
        say: [
          'Our monthly, semi-annual, and annual reports analyze the work to date and lay out conclusions and recommendations.',
        ],
        stats: [
          { figure: '12', label: 'reports a year' },
          { figure: '1', label: 'annual wrap-up' },
        ],
      },
    },
    {
      number: '05',
      title: 'Proactivity',
      text: 'We recommend new opportunities and solutions.',
      image: '/assets/step-3.png',
      proof: {
        title: 'An initiative beyond the brief',
        say: [
          "For Pracuj.pl we proposed an AR filter — an extra tool for the brand's communication goals that raised its organic-engagement potential. Users and influencers alike made their own content with it, without a single paid partnership.",
        ],
        stats: [
          { figure: '6.79M', label: 'views' },
          { figure: '4,885', label: 'user videos' },
        ],
        client: 'pracuj-pl',
        href: 'pracuj-pl#podejscie',
      },
    },
  ],
} satisfies LocalizedHome['howItWorks']

// —— Testimonials ——————————————————————————————————————————————————————————

export const testimonials = [
  {
    quote:
      "For nearly two years we've worked with Social Lama on TikTok and YouTube, and we can wholeheartedly recommend them. The team stands out for its knowledge and skill, and for a true partnership approach — we can always count on commitment, smooth communication, and real support in reaching our goals.",
    author: 'Małgorzata Radomska',
    company: 'iRobot Polska',
    image: '/assets/testimonial-radomska.jpg',
    logo: '/assets/clients/irobot.svg',
    pull: {
      before: 'We can wholeheartedly ',
      highlight: 'recommend them',
      after: '.',
    },
  },
  {
    quote:
      "We're happy with Social Lama's work on social media. The agency built the profile concept and communication strategy for one of our products from scratch, effectively and consistently winning an ever-wider group of engaged followers. Creative ideas, striking visuals, interesting solutions tailored to the target audience — all with diligence and full professionalism. I highly recommend Social Lama for projects that need to break the mold.",
    author: 'Marta Szwat',
    company: 'Uniphar',
    image: '/assets/testimonial-szwat.jpg',
    logo: '/assets/clients/uniphar.png',
    pull: {
      before: 'Projects that ',
      highlight: 'break the mold',
      after: '.',
    },
  },
  {
    quote:
      'Social Lama is a professional team of specialists that supported the STAG brand across social media. The agency developed a communication strategy that matched our brand-image goals and ran communication in two languages. I recommend Social Lama for their proactivity, creativity, and commitment to the project.',
    author: 'Marta Jemiejłańczuk',
    company: 'STAG',
    image: '/assets/testimonial-jemiejlanczuk.jpg',
    logo: '/assets/clients/stag.svg',
    pull: {
      highlight: 'Proactivity, creativity',
      after: ' and commitment.',
    },
  },
  {
    quote:
      "I honestly recommend working with Social Lama. The team understood our needs perfectly and built a fitting communication strategy that they consistently deliver against our goals. We're happy with the results.",
    author: 'Piotr Treszczotko',
    company: 'Funtronic',
    image: '/assets/testimonial-treszczotko.jpg',
    logo: '/assets/clients/funtronic.png',
    pull: {
      before: 'The team ',
      highlight: 'understood perfectly',
      after: ' what we needed.',
    },
  },
  {
    quote:
      "Social Lama is an agency that fully meets our expectations. The team's work proved satisfying enough that we decided to expand the collaboration to further projects. The agency brings new solutions and ideas that we bring to life together.",
    author: 'Beata Nartowska',
    company: 'Aquael',
    image: '/assets/testimonial-nartowska.jpg',
    logo: '/assets/clients/aquael.png',
    pull: {
      highlight: 'Fully meets',
      after: ' our expectations.',
    },
  },
  {
    quote:
      'Social Lama was responsible for our communication strategy, subject-matter consulting, copywriting, moderation, and graphic design. Given our goals and target audience, we jointly decided to focus communication on LinkedIn. We recommend working with the Social Lama team.',
    author: 'Katarzyna Gosiewska',
    company: 'Intrum',
    image: '/assets/testimonial-gosiewska.jpg',
    logo: '/assets/clients/intrum.png',
    pull: {
      highlight: 'We recommend working',
      after: ' with the Social Lama team.',
    },
  },
] satisfies LocalizedHome['testimonials']

export const testimonialLabels = {
  sectionTitle: 'Client testimonials',
  railLabel: 'Choose a testimonial',
  itemLabel: 'Testimonial',
} satisfies LocalizedHome['testimonialLabels']

// —— FAQ ————————————————————————————————————————————————————————————————————

/**
 * `ASK / THE LAMA` is English already, so the heading is shared verbatim with
 * the Polish set — only the eyebrow and the entries are localised.
 *
 * Five entries translate directly. The sixth is authored, not translated: the
 * Polish original is a local-SEO instrument (Warszawa, Pabianice, Białystok,
 * Poznań) and none of that signal exists for an English reader, so it asks the
 * equivalent question for this audience — see design.md Decision 7.
 */
export const faq = {
  heading: ['ASK', 'THE LAMA'],
  eyebrow: 'FREQUENTLY ASKED QUESTIONS',
  ariaLabel: 'Frequently asked questions',
  items: [
    {
      question: 'How much does it cost to have an agency run your social media?',
      answer:
        "It depends on how many platforms you're on, how often you publish, and how wide the scope is — market rates run from about 3,000 to 15,000 PLN a month. Professional management of a single profile usually starts around 920 PLN net per month. One thing worth knowing: unlike a lot of agencies, Social Lama always bills the ad budget separately, so you can see exactly what you're paying for the work and what actually goes into campaigns.",
    },
    {
      question:
        'How is an agency different from a freelancer or an in-\u2060house social media manager?',
      answer:
        "A freelancer is one person — an agency is a strategist, a copywriter, a designer, a campaign specialist, and a moderator, which puts the quality and the pace in a different league. An in-house manager sits close to the brand, but hiring one runs to well over ten thousand złoty a month, plus tools and training. An agency gives you a whole marketing department's worth of skills for the price of one salary, and professional analytics tools on top.",
    },
    {
      question:
        'When will the first results of Social Lama running your social media show up?',
      answer:
        'The first qualitative results — a coherent brand image, higher engagement, a better-positioned profile — usually show after 4–8 weeks. Sales results and lead generation depend on your ad budget and buying cycle: a well-defined social media strategy is 466% more likely to succeed, and ad campaigns can lift revenue by as much as 1000% in three months. And 83% of clients who start with a trial campaign stay with us for the long run.',
    },
    {
      question: 'How do you measure whether social media is working?',
      answer:
        "Every social media strategy runs on KPIs matched to your goals — reach, engagement, website traffic, leads, or e-commerce sales. We use professional analytics tools alongside the platforms' native stats, so we tune both the work and the ad budget as we go. Every month you get a clear report with the results and our recommendations for the next one.",
    },
    {
      question: 'How do you pick a good social media agency?',
      answer:
        "Look at the agency's past work, ask for a case study from your industry, and check whether it builds strategies around the client or works off templates. A good social media agency — Social Lama included — will ask you more questions than it makes promises, because it has to understand your audiences, your business goals, and your competition first. Pick a partner that communicates transparently, shows measurable results, and keeps up with what's actually happening on the platforms.",
    },
    {
      question: 'Do you work with brands outside Poland?',
      answer:
        "Yes. Our office is in Warsaw, but we work with clients across Poland and run a share of our projects as bilingual communication aimed at foreign markets. Brands we've worked with include Aflofarm, STAG (AC S.A.), Press-Service Media Monitoring, Pracuj.pl, Medicover, Manpower and Aquael. Briefs, status meetings and reporting all run remotely, so where you're based makes no difference to us — what matters is fitting the strategy to your goals.",
    },
  ],
} satisfies LocalizedHome['faq']

// —— CTA ————————————————————————————————————————————————————————————————————

export const joinCta = {
  headingLead: 'NEED A HAND',
  // English drops the Polish locative cases — a flat "ON <platform>?" per token,
  // "?" kept inside so it never detaches from the sliding word.
  // Seven platform tokens only: each drives a cube and a services list, which
  // the two discipline tokens never had. Cube paths mirror the PL file (and
  // uslugi.en.ts) — artwork is not localized, only the copy around it.
  rotator: [
    {
      token: 'ON FACEBOOK?',
      cube: '/assets/cube-facebook-70862a.png',
      services: [
        'posts worth engaging with',
        'community management',
        'conversations in groups',
        'Meta Ads campaigns',
      ],
    },
    {
      token: 'ON INSTAGRAM?',
      cube: '/assets/cube-instagram.png',
      services: [
        'an aesthetic feed',
        'reels and stories',
        'a consistent look',
        'Meta Ads campaigns',
      ],
    },
    {
      token: 'ON TIKTOK?',
      cube: '/assets/cube-tiktok.png',
      services: [
        'short video',
        'trends and real-time',
        'the platform’s language',
        'TikTok Ads campaigns',
      ],
    },
    {
      token: 'ON LINKEDIN?',
      cube: '/assets/cube-linkedin.png',
      services: [
        'expert personal branding',
        'B2B communication',
        'authority worth trusting',
      ],
    },
    {
      token: 'ON PINTEREST?',
      cube: '/assets/cube-pinterest-6e33ed.png',
      services: [
        'inspiration and how-tos',
        'visual collections',
        'search intent',
        'traffic to your site',
      ],
    },
    {
      token: 'ON X (TWITTER)?',
      cube: '/assets/cube-x-5d9863.png',
      services: [
        'fast, reactive communication',
        'an expert brand voice',
        'real-time marketing',
      ],
    },
    {
      token: 'ON YOUTUBE?',
      cube: '/assets/cube-youtube.png',
      services: [
        'long and short video',
        'subscribers who stay',
        'positioning as the source',
      ],
    },
  ],
  servicesLead: 'WHAT WE DO',
  llama: '/assets/join-cta-llama.webp',
  llamaAlt:
    'A llama in a navy suit and burgundy cravat with one raised paw — the Social Lama mascot',
  post: {
    href: 'https://www.instagram.com/social.lama/',
    handle: 'social.lama',
    meta: 'Sponsored',
    metaNote: "you'll like it anyway",
    metaNoteLiked: 'told you so',
    likes: '1,024 likes',
    likesLiked: '1,025 likes',
    caption: "When a client asks if we've got it all covered 🦙💪",
    onInstagram: 'on Instagram',
    like: 'Like this post',
    share: 'Share this post',
    shareCopied: 'Link copied',
    save: 'Save this post',
    // Not a literal translation of the PL line — the joke has to land in
    // English on its own, and "saved posts don't make content" does.
    saveToast: "Saved. Though a saved post has never made anyone's content.",
    saveToastCta: 'WRITE TO US',
    comment: 'Show comments',
    thread: [
      {
        author: 'agnieszka.p',
        question: 'Our industry is boring.',
        answer:
          'There are no boring industries, only boring posts. We have case studies from "no potential" ones.',
      },
    ],
    menu: 'More options',
    menuItems: [
      {
        label: 'Why am I seeing this ad?',
        answer:
          "Because it isn't an ad — it's a section on our own site. But admit it, for a second there it looked real. That's the kind we make for clients.",
      },
      {
        label: 'Hide this ad',
        answer:
          'Sure, we can hide it. That leaves just a llama in a suit — and honestly, he outperforms a lot of campaigns.',
      },
      {
        label: 'Report',
        answer:
          'Your report went straight to the department sitting at the next desk. They promised to look into it over coffee.',
      },
    ],
    menuCta: { label: 'WRITE TO US', href: '/en/contact' },
  },
  button: { label: 'WRITE TO US', href: '/en/contact' },
} satisfies LocalizedHome['joinCta']

// —— NewsLAMA ——————————————————————————————————————————————————————————————
// "NewsLAMA" is the brand name of the section and stays untranslated; only the
// read label is localized.

export const news = {
  heading: 'NewsLAMA',
  readLabel: 'READ IT',
} satisfies LocalizedHome['news']

// —— Footer ————————————————————————————————————————————————————————————————

export const footer = {
  wordmark: 'Social Lama',
  headline: "LET'S TALK ABOUT YOUR BUSINESS",
  cta: { label: 'WRITE TO US', href: '/en/contact' },
  columns: [
    {
      title: 'NAVIGATION',
      links: [
        { label: 'ABOUT US', href: '/en/about-us' },
        // { label: 'TRAINING & COURSES', href: '/en/training' }, // delayed launch — no page yet, keep out of nav
        { label: 'BLOG', href: '/en/blog' },
        { label: 'CASE STUDIES', href: '/en/case-studies' },
        { label: 'BECOME A LAMA', href: '/en/become-a-lama' },
        { label: 'CONTACT', href: '/en/contact' },
      ],
    },
    {
      // Service detail pages, not the `/en/services` hub (design D4).
      title: 'SERVICES',
      links: [
        { label: 'Strategy', href: '/en/services/strategy' },
        { label: 'Content', href: '/en/services/content' },
        { label: 'Sales', href: '/en/services/sales' },
        { label: 'Ad Campaigns', href: '/en/services/ad-campaigns' },
        { label: 'Creative & Video', href: '/en/services/creative-video' },
        { label: 'Audit & Consulting', href: '/en/services/audit-consulting' },
        {
          label: 'Influencer Marketing',
          href: '/en/services/influencer-marketing',
        },
      ],
    },
    {
      // Same canonical industry list as the overlay menu (design D3).
      title: 'OFFER',
      links: industryNav,
    },
  ],
  contactTitle: 'CONTACT',
  contact: {
    phone: '+48 796 996 118',
    email: 'halohalo@sociallama.pl',
    addresses: [
      'ul. Płocka 9/11B, 01-231 Warsaw',
      'ul. Januszowicka 5/121, 53-135 Wrocław',
    ],
  },
  copyright: 'Copyright 2026 sociallama. All rights reserved.',
  legal: [{ label: 'Privacy Policy', href: '/en/privacy-policy' }],
} satisfies LocalizedHome['footer']
