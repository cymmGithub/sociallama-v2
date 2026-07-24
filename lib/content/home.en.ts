/**
 * English homepage + chrome content — the EN twin of `home.ts`.
 *
 * Each block `satisfies LocalizedHome['<key>']`, so a missing or mis-shaped
 * translation fails the build (design D2). Structural notes mirror the Polish
 * module; only strings and hrefs differ. `socials` is locale-independent
 * (real profile URLs) and stays imported from `home.ts` — not re-exported here.
 *
 * Voice: playful but clean, American spelling (user-approved 2026-07-22).
 */
import { industryNav } from '@/lib/content/branze.en'
import type { LocalizedHome } from '@/lib/content/home'

// —— Chrome: top bar ————————————————————————————————————————————————————————

export const nav = {
  logoAlt: 'Social Lama',
  logo: '/assets/logo.svg',
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
// under /en). BLOG is omitted from EN chrome.

export const menu = {
  columns: [
    {
      // Derived from the canonical industry module (design D3).
      label: 'INDUSTRIES',
      items: industryNav,
    },
    {
      label: 'SERVICES',
      items: [
        { label: 'Strategy', href: '/en/services/strategy' },
        { label: 'Content', href: '/en/services/content' },
        { label: 'Sales', href: '/en/services/sales' },
        { label: 'Creative & Video', href: '/en/services/creative-video' },
        { label: 'Audit & Consulting', href: '/en/services/audit-consulting' },
        {
          label: 'Influencer Marketing',
          href: '/en/services/influencer-marketing',
        },
        { label: 'Training & Courses', href: '/en/training' },
      ],
    },
  ],
  utility: [
    { label: 'ABOUT US', href: '/en/about-us' },
    { label: 'CASE STUDIES', href: '/en/case-studies' },
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
  tip: 'waiting for case study :)',
} satisfies LocalizedHome['clientCardCta']

// Same lorem placeholder as PL — these entries are launch blockers in both
// locales (real quotes pending).
const placeholderQuote =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'

export const clients = [
  {
    name: 'Aflofarm',
    logo: '/assets/clients/aflofarm.png',
    testimonial: {
      quote: placeholderQuote,
      author: 'Name Surname',
      company: 'Aflofarm',
    },
  },
  {
    name: 'Aquael',
    logo: '/assets/clients/aquael.png',
    testimonial: {
      quote:
        "Social Lama is an agency that fully meets our expectations. The team's work proved satisfying enough that we decided to expand the collaboration to further projects.",
      author: 'Beata Nartowska',
      company: 'Aquael',
      image: '/assets/testimonial-nartowska.jpg',
    },
  },
  {
    name: 'Funtronic',
    logo: '/assets/clients/funtronic.png',
    testimonial: {
      quote:
        'I honestly recommend working with Social Lama. The team understood our needs perfectly and built a fitting communication strategy that they consistently deliver against our goals.',
      author: 'Piotr Treszczotko',
      company: 'Funtronic',
      image: '/assets/testimonial-treszczotko.jpg',
    },
  },
  {
    name: 'Intrum Justitia',
    logo: '/assets/clients/intrum.png',
    testimonial: {
      quote:
        'Social Lama handled our communication strategy, subject-matter consulting, copywriting, moderation, and graphic design. We recommend working with the Social Lama team.',
      author: 'Katarzyna Gosiewska',
      company: 'Intrum Justitia',
      image: '/assets/testimonial-gosiewska.jpg',
    },
  },
  {
    name: 'Kontigo',
    logo: '/assets/clients/kontigo.png',
    testimonial: {
      quote: placeholderQuote,
      author: 'Name Surname',
      company: 'Kontigo',
    },
  },
  {
    name: 'Medicover Sport',
    logo: '/assets/clients/medicover.png',
    testimonial: {
      quote: placeholderQuote,
      author: 'Name Surname',
      company: 'Medicover Sport',
    },
  },
  {
    name: 'Oryginalny Sok',
    logo: '/assets/clients/oryginalny-sok.png',
    testimonial: {
      quote: placeholderQuote,
      author: 'Name Surname',
      company: 'Oryginalny Sok',
    },
  },
  {
    name: 'Press-Service',
    logo: '/assets/clients/press-service.png',
    testimonial: {
      quote: placeholderQuote,
      author: 'Name Surname',
      company: 'Press-Service',
    },
  },
  {
    name: 'Riviera',
    logo: '/assets/clients/riviera.png',
    testimonial: {
      quote: placeholderQuote,
      author: 'Name Surname',
      company: 'Riviera',
    },
  },
  {
    name: 'Uniphar',
    logo: '/assets/clients/uniphar.png',
    testimonial: {
      quote:
        'Creative ideas, striking visuals, interesting solutions tailored to the target audience — all with diligence and full professionalism. I highly recommend Social Lama for projects that need to break the mold.',
      author: 'Marta Szwat',
      company: 'Uniphar',
      image: '/assets/testimonial-szwat.jpg',
    },
  },
  {
    name: 'Worldline',
    logo: '/assets/clients/worldline.png',
    testimonial: {
      quote: placeholderQuote,
      author: 'Name Surname',
      company: 'Worldline',
    },
  },
  {
    name: 'pracuj.pl',
    logo: '/assets/clients/pracuj.png',
    caseStudySlug: 'pracuj-pl',
    testimonial: {
      quote: placeholderQuote,
      author: 'Name Surname',
      company: 'pracuj.pl',
    },
  },
] satisfies LocalizedHome['clients']

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
  // CTA card filling the last grid slot — jumps to the "OUR LAMAS" team slider.
  teamCta: { label: 'Learn more', href: '/en/about-us#zespol' },
  teamLabel: 'Social Lama team',
  certsLabel: 'Certificates',
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
  soonLabel: 'Soon',
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
            src: '/case-studies/volvo/volvo-vcw-post.jpg',
            alt: 'Volvo Car Warszawa Instagram post featuring a Volvo car',
            width: 351,
            height: 760,
          },
          {
            src: '/case-studies/pracuj-pl/pracuj-pl-humor-cat.jpg',
            alt: 'Playful Pracuj.pl TikTok meme — “memes brought to life”',
            width: 528,
            height: 1148,
          },
          {
            src: '/case-studies/volvo/volvo-vcw-goracy.jpg',
            alt: 'Volvo “Hot season?” creative on getting your car ready for summer',
            width: 351,
            height: 760,
          },
          {
            src: '/case-studies/pracuj-pl/pracuj-pl-ar-creator.jpg',
            alt: 'Creator filming with the “Dream Job” AR filter by Pracuj.pl',
            width: 555,
            height: 1200,
          },
          {
            src: '/case-studies/volvo/volvo-event-ex30.jpg',
            alt: 'Electric Volvo EX30 on display at an outdoor event',
            width: 406,
            height: 720,
          },
          {
            src: '/case-studies/pracuj-pl/pracuj-pl-humor-pov.jpg',
            alt: 'Playful Pracuj.pl TikTok in POV format about job hunting',
            width: 528,
            height: 1148,
          },
          {
            src: '/case-studies/volvo/volvo-event-noc.jpg',
            alt: 'Volvo showroom during Museum Night — a concert in moody lighting',
            width: 406,
            height: 720,
          },
          {
            src: '/case-studies/pracuj-pl/pracuj-pl-ar-grid.jpg',
            alt: '“Dream Job – Pracuj.pl” AR filter page on TikTok with a grid of user videos',
            width: 362,
            height: 776,
          },
          {
            src: '/case-studies/volvo/volvo-konkurs-podium.jpg',
            alt: "Winners' podium of Volvo's kids drawing contest at an outdoor event",
            width: 406,
            height: 720,
          },
          {
            src: '/case-studies/pracuj-pl/pracuj-pl-edu.jpg',
            alt: 'Educational Pracuj.pl TikTok — “how to write a cover letter?”',
            width: 328,
            height: 701,
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
          { placeholder: 'waiting for iRobot video' },
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
  steps: [
    {
      number: '01',
      text: 'We pin down your goals, needs, and possibilities in a strategy workshop.',
      image: '/assets/step-1.png',
    },
    {
      number: '02',
      text: 'We build a tailored strategy and kick your communication off.',
      image: '/assets/step-2.png',
    },
    {
      number: '03',
      text: 'We proactively recommend new solutions and opportunities.',
      image: '/assets/step-3.png',
    },
    {
      number: '04',
      text: 'We analyze the results and make the changes that are needed.',
      image: '/assets/step-4.png',
    },
    {
      number: '05',
      text: 'We report on everything we do.',
      image: '/assets/step-5.png',
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

// —— CTA ————————————————————————————————————————————————————————————————————

export const joinCta = {
  headingLead: 'NEED A HAND',
  // English drops the Polish locative cases — a flat "ON <platform>?" per token,
  // "?" kept inside so it never detaches from the sliding word.
  rotator: [
    { token: 'ON FACEBOOK?' },
    { token: 'ON INSTAGRAM?' },
    { token: 'ON TIKTOK?' },
    { token: 'ON LINKEDIN?' },
    { token: 'ON PINTEREST?' },
    { token: 'ON X (TWITTER)?' },
    { token: 'ON YOUTUBE?' },
    { token: 'WITH STRATEGY?' },
    { token: 'WITH VIDEO?' },
  ],
  clip: '/clips/cta-llama-work.mp4',
  poster: '/clips/cta-llama-work-poster.jpg',
  post: {
    href: 'https://www.instagram.com/social.lama/',
    handle: 'social.lama',
    meta: 'Sponsored',
    metaNote: "you'll like it anyway",
    likes: '1,024 likes',
    caption: "When a client asks if we've got it all covered 🦙💪",
    onInstagram: 'on Instagram',
  },
  llamaAlt:
    'A many-armed llama in a tweed vest holding a laptop, phone, paintbrush, clapperboard, mug, and parcel — the Social Lama mascot',
  button: { label: 'WRITE TO US', href: '/en/contact' },
} satisfies LocalizedHome['joinCta']

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
        { label: 'SERVICES', href: '/en/services' },
        { label: 'TRAINING & COURSES', href: '/en/training' },
        { label: 'CASE STUDIES', href: '/en/case-studies' },
        { label: 'CONTACT', href: '/en/contact' },
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
