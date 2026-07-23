/**
 * English `/o-nas` (About) content — EN twin of `o-nas.ts`.
 *
 * Each block `satisfies LocalizedONas['<key>']` (design D2). The reused homepage
 * sections (ClientLogos, BigMarquee, JoinCta) take their English copy from
 * `home.en.ts`; only the about-specific sections live here. Anchor hrefs
 * (`#zespol`) and asset paths are locale-independent and kept verbatim.
 *
 * Voice: playful but clean, American spelling (user-approved 2026-07-22).
 */
import type { LocalizedONas } from '@/lib/content/o-nas'

export const oNasMeta = {
  title: 'About us',
  description:
    'Meet Social Lama — the social media agency running full-service brand communication across social: strategy, content, community, and campaigns that actually perform.',
} satisfies LocalizedONas['oNasMeta']

export const oNasHero = {
  kicker: 'SOCIAL LAMA',
  heading: 'ABOUT THE AGENCY',
  llamaAlt: 'The Social Lama llama in a beige coat, waving at the camera',
} satisfies LocalizedONas['oNasHero']

export const oNasAbout = {
  headingLead: 'SOMETHING',
  headingRest: 'ABOUT THE LAMA',
  body: "Social Lama is a social media agency handling full-service brand communication on social — plus effective advertising on Facebook, Instagram, and beyond. We'll build a strategy that works, craft creative communication, take care of your community, and run a campaign that actually delivers.",
  cta: { label: 'DISCOVER OUR EXPERIENCE', href: '#zespol' },
  imageAlt: 'Illustration of the Social Lama llama herd in a wooden frame',
} satisfies LocalizedONas['oNasAbout']

export const oNasValues = {
  center: { lead: 'THAT WORKS', rest: 'WITH SOCIAL LAMA' },
  items: [
    {
      title: 'Strategic partnership',
      body: "We don't run activity just to be present on social. First we understand your business — its goals, operating model, challenges, and market context — and only then do we design a strategy. So you can be sure social media genuinely supports sales, lead generation, awareness, or brand building.\n\nYou get a partner who thinks about your result, not just your posts.",
    },
    {
      title: 'Proactive approach',
      body: "We don't wait for a brief or a reminder. We regularly analyze results, trends, and algorithm changes to propose new directions and improvements. For you, that means an easy collaboration and the confidence that the project is always looked after.\n\nYou gain a team that thinks about growing your brand even while you focus on other parts of the business.",
    },
    {
      title: 'Focus on results',
      body: "Aesthetics matter, but they're not the goal in themselves. Every activity has a defined objective and measurable success metrics. So you can report concrete results to your board or owners — not just reach.\n\nOur work is designed to translate into real business value.",
    },
    {
      title: 'Expertise that gives you an edge',
      body: 'We specialize in social media and digital marketing. We track trends, tools, and tech shifts, and we put them to work. Partnering with us, you get current know-how and proven solutions — without having to build an in-house team of specialists.',
    },
    {
      title: 'Individual approach',
      body: "We don't copy solutions between clients. Every strategy is built around the specifics of your industry, your audience, and your company's stage of growth. That means communication tailored to your brand, not a one-size-fits-all model. Your goals are the starting point for every recommendation.",
    },
    {
      title: 'Full-service scope',
      body: "We're part of the Good One marketing and consulting group, which lets us work far beyond social media alone.\n\nFor you, that means one coherent direction and a broad bench of skills — without having to coordinate a pile of separate vendors.",
    },
    {
      title: 'Transparency',
      body: 'No fine print, no hidden terms — just openness and honesty in how we work.',
    },
  ],
} satisfies LocalizedONas['oNasValues']

export const oNasProjects = {
  headingLead: 'Recently completed',
  headingRest: 'projects',
  cta: 'View',
  items: [
    {
      name: 'How to blend humor with education on social media?',
      year: '2024',
      client: 'iRobot',
      logo: '/case-studies/irobot/irobot-logo.png',
      logoW: 808,
      logoH: 160,
      image: '/case-studies/irobot/irobot-cover.jpg',
      href: '/en/case-studies/irobot',
    },
    {
      name: 'How to build a community on TikTok?',
      year: '2022',
      client: 'Pracuj.pl',
      logo: '/assets/clients/pracuj.png',
      logoW: 176,
      logoH: 45,
      image: '/case-studies/pracuj-pl/pracuj-pl-cover.jpg',
      href: '/en/case-studies/pracuj-pl',
    },
    {
      name: 'How to build brands on social media?',
      year: '2025',
      client: 'Volvo Car Warszawa',
      logo: '/case-studies/volvo/volvo-logo.png',
      logoW: 509,
      logoH: 69,
      image: '/case-studies/volvo/volvo-cover.jpg',
      href: '/en/case-studies/volvo',
    },
  ],
} satisfies LocalizedONas['oNasProjects']

export const oNasGoodOne = {
  heading: 'WE ARE PART OF',
  headingAccent: 'GOOD ONE',
  body: 'Social Lama is part of the Good One marketing group, which lets us deliver full-service work through access to specialists across the other areas of communication: digital, social media, design, SEO & SEM, and influencer marketing.',
  center: 'GOOD ONE',
  wheelAlt:
    'The Good One group: Good One PR, SEOFLY, Folks, TymKor media, Diea, and Social Lama',
  spokes: [
    {
      label: 'Good One PR',
      kind: 'PUBLIC RELATIONS',
      logo: '/o-nas/good-one/goodone-pr.png',
      w: 305,
      h: 59,
    },
    {
      label: 'Social Lama',
      kind: 'SOCIAL MEDIA',
      logo: '/o-nas/good-one/sociallama.png',
      w: 184,
      h: 134,
    },
    {
      label: 'Diea',
      kind: 'GRAPHICS & DESIGN',
      logo: '/o-nas/good-one/diea.png',
      w: 236,
      h: 68,
    },
    {
      label: 'TymKor media',
      kind: 'AD CAMPAIGNS',
      logo: '/o-nas/good-one/tymkor.png',
      w: 218,
      h: 69,
      scale: 0.85,
    },
    {
      label: 'Folks',
      kind: 'INFLUENCER MARKETING',
      logo: '/o-nas/good-one/folks.png',
      w: 228,
      h: 66,
      scale: 0.85,
    },
    {
      label: 'SEOFLY',
      kind: 'SEO & SEM',
      logo: '/o-nas/good-one/seofly.png',
      w: 285,
      h: 73,
    },
  ],
} satisfies LocalizedONas['oNasGoodOne']

export const oNasTeam = {
  kickerLead: 'OUR',
  kickerRest: 'LAMAS',
  heading: 'MEET THE TEAM',
  prevLabel: 'Previous person',
  nextLabel: 'Next person',
  members: [
    {
      given: 'ANIA',
      surname: 'OZGA',
      role: 'Head of Social Media',
      bio: 'With Social Lama since 2017, pairing strategic thinking with the day-to-day of client and team work. She builds communication strategies for Polish and international brands — the kind that actually move the business numbers.',
      photo: '/o-nas/slider/anna-ozga.png',
    },
    {
      given: 'AGNIESZKA',
      surname: 'KLAJBERT',
      role: 'Senior Social Media Specialist',
      bio: 'Five years in marketing and social media. She pairs a passion for photography with a background in management and advertising graphics, knowing that good social is a mix of aesthetics, psychology, humor, and a touch of madness.',
      photo: '/o-nas/slider/agnieszka-klajbert.png',
    },
    {
      given: 'PIOTREK',
      surname: 'ZACH',
      role: 'Project Manager',
      bio: 'At Social Lama since 2019, running full-service client work and shaping creative concepts and copy for the whole team. He blends a marketing and linguistics background, betting on words that genuinely build communication.',
      photo: '/o-nas/slider/piotr-zach.png',
    },
    {
      given: 'EMILIA',
      surname: 'METRYKA',
      role: 'Social Media Manager',
      bio: 'She started at Warner Bros. Discovery, building communication for brands like player.pl, TVN, and HBO Max. Today at Social Lama she leads a team, coordinates the video unit, and owns strategy and campaigns for brands across many industries.',
      photo: '/o-nas/slider/emilia-metryka.png',
    },
    // TEMP: excluded pending a better source photo (mirrors o-nas.ts) — low-res
    // square crop that can't match the front-facing set. Re-enable in both files.
    // {
    //   given: 'PAULINA',
    //   surname: 'HILDEBRAND',
    //   role: 'Social Media Manager',
    //   bio: "She pairs a humanist's feel for words with an analytical take on data, making communication that actually works on social. She specializes in running brand profiles end to end — from strategy to client relationships.",
    //   photo: '/o-nas/slider/paulina-hildebrand.png',
    // },
    {
      given: 'MAGDA',
      surname: 'ROKICKA',
      role: 'Social Media Manager',
      bio: 'Over 12 years in marketing, specializing in communication strategy, social media, content marketing, and podcasts. After hours she educates the industry — running trainings and her own podcast. DIMAQ Professional certified.',
      photo: '/o-nas/slider/magda-rokicka.png',
    },
    {
      given: 'KORNELIA',
      surname: 'ORLIK',
      role: 'Social Media Expert',
      bio: 'She specializes in B2B and medical-sector brand communication, pairing a strategic approach with management know-how. She also creates the visuals — graphics, video, and UGC.',
      photo: '/o-nas/slider/kornelia-orlik.png',
    },
    // TEMP: excluded pending a better source photo (mirrors o-nas.ts) — low-res
    // square crop, tilted pose. Re-enable in both files together.
    // {
    //   given: 'KATARZYNA',
    //   surname: 'KAPTUR',
    //   role: 'Social Media Expert',
    //   bio: 'Over 4 years in marketing — at Social Lama she creates engaging content and helps brands build a coherent, strong presence online. She blends a Communication Management background with a creative take on content.',
    //   photo: '/o-nas/slider/katarzyna-kaptur.png',
    // },
    {
      given: 'OLIWIA',
      surname: 'WITEWSKA',
      role: 'Social Media Specialist',
      bio: "For over 10 years she's run brand communication on social, building experience on projects for global brands in beauty, FMCG, home appliances, and lifestyle. She bets on authenticity, emotion, and lasting brand–audience relationships.",
      photo: '/o-nas/slider/oliwia-witewska.png',
    },
    {
      given: 'KAROLINA',
      surname: 'MARCINOWSKA',
      role: 'Video Content Creator',
      bio: 'At Social Lama she owns video content — from concept, through filming, to editing and fitting the brand strategy. She brings a feel for trends and aesthetics, making material that grabs attention and builds engagement.',
      photo: '/o-nas/slider/karolina-marcinowska.png',
    },
    {
      given: 'MARTYNA',
      surname: 'BOROWIK',
      role: 'Senior Social Media Specialist',
      bio: 'She pairs a strategic view with communication instinct, helping brands find their own, coherent direction. Over 10 years in marketing and digital — from strategy, through engaging content, to reading the results.',
      photo: '/o-nas/slider/martyna-borowik.png',
    },
    // TEMP: excluded from the slider (see the o-nas.ts note) — tight head+
    // shoulders crop floats in the full-height frame. Kept in the homepage
    // team grid. Re-enable here in sync with o-nas.ts.
    // {
    //   given: 'PRZEMYSŁAW',
    //   surname: 'ŚWIERCZ',
    //   role: 'Fullstack Developer',
    //   bio: 'Owns the build and upkeep of the Social Lama site — front end, back end, performance and deploys — keeping the whole thing fast and reliable.',
    //   photo: '/o-nas/slider/przemyslaw-swiercz.png',
    // },
  ],
} satisfies LocalizedONas['oNasTeam']
