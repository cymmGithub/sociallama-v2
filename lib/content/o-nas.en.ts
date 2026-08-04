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
import { type LocalizedONas, toTeamGrid } from '@/lib/content/o-nas'

export const oNasMeta = {
  title: 'About us',
  description:
    'Meet Social Lama — the social media agency running full-service brand communication across social: strategy, content, community, and campaigns that actually perform.',
} satisfies LocalizedONas['oNasMeta']

export const oNasHero = {
  kicker: 'SOCIAL LAMA',
  heading: 'ABOUT US',
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
  certLabels: {
    dimaq: 'DIMAQ Professional certificate',
    meta: 'Meta certificate',
  },
  members: [
    {
      given: 'ANNA',
      surname: 'OZGA',
      role: 'Head of Social Media',
      certs: ['dimaq'],
      bio: 'With Social Lama since 2017, pairing strategic thinking with the day-to-day of client and team work. She builds and rolls out communication strategies for Polish and international brands, and gets the most out of growing projects that genuinely move the business numbers.',
      photo: '/o-nas/slider/anna-ozga.png',
    },
    {
      given: 'KAMIL',
      surname: 'MAZURUK',
      role: 'Founder, Good One Group',
      bio: "Founder of the Good One group, which since 2009 has been helping Polish and global brands — leaders in their fields — grow their potential through understanding, sharp advice, and effective work across marketing, sales, and management. He backs the Social Lama team with strategic advice and the business experience of the whole group. Beyond Good One, he advises startups and SME boards, and invests his own resources — and the group's — in building new business ventures. In life and business he values trust, proactivity, optimism, understanding, and partnership.",
      link: { label: 'goodone.co', href: 'https://goodone.co' },
      photo: '/o-nas/slider/kamil-mazuruk.png',
    },
    {
      given: 'ROBERT',
      surname: 'SAWICKI',
      role: 'Art & Creative Director',
      bio: "Art & Creative Director at Diea, a creative agency specializing in branding, graphic design, video production, and animation. He pairs an aesthetic eye with strategic thinking — from visual identities, through campaign key visuals, to digital assets. He supports the Social Lama team on creative concepts, branding, and design. He makes sure the creative work doesn't just look good, but genuinely works toward the brand's goals.",
      link: { label: 'diea.pl', href: 'https://www.diea.pl' },
      photo: '/o-nas/slider/robert-sawicki.png',
    },
    {
      given: 'EMILIA',
      surname: 'METRYKA',
      role: 'Social Media Manager',
      bio: 'She started at Warner Bros. Discovery, building communication for brands like player.pl, TVN, and HBO Max. Today she leads a team at Social Lama, coordinates the video unit, and owns strategy and campaigns for brands across many sectors — from FMCG and beauty to energy and real estate. She brings the world of interviews, premieres, and film sets to a business-minded approach to digital.',
      photo: '/o-nas/slider/emilia-metryka.png',
    },
    {
      given: 'PAULINA',
      surname: 'HILDEBRAND',
      role: 'Social Media Manager',
      bio: 'She pairs a humanities sensitivity to language with an analytical approach to data, which is how she builds communication that actually works on social. She specializes in running brand profiles end to end — from strategy and creative concepts, through coordination, to client relationships. She has served clients in FMCG, logistics, hospitality, consumer electronics, automotive, and HVAC. Off the clock, a happy mum and a cat person.',
      photo: '/o-nas/slider/paulina-hildebrand.png',
    },
    {
      given: 'MAGDA',
      surname: 'ROKICKA',
      role: 'Social Media Manager',
      certs: ['dimaq'],
      bio: 'Over 12 years in the marketing industry. She specializes in communication strategy, social media, moderation, content marketing, and podcasts. She has worked with brands in beauty, retail, FMCG, automotive, real estate, pharma, and e-commerce. After hours she works to educate the industry — running trainings, publishing expert pieces, and sharing what she knows on her own podcast.',
      photo: '/o-nas/slider/magda-rokicka.png',
    },
    {
      given: 'PIOTREK',
      surname: 'ZACH',
      role: 'Project Manager',
      bio: 'With Social Lama since 2019. He handles full client service plus creative concepts and copy, supporting the whole team in both. He pairs a marketing and philology background with experience working for brands in FMCG, automotive, renewables, electronics, and real estate. He backs the word that genuinely builds communication. Off the clock, a fan of sport broadly defined and of internet memes.',
      photo: '/o-nas/slider/piotr-zach.png',
    },
    {
      given: 'AGNIESZKA',
      surname: 'KLAJBERT',
      role: 'Senior Social Media Specialist',
      bio: 'Five years in marketing and social media. She pairs a passion for photography with a background in management and advertising graphics, which is why she thrives on content production and unconventional concepts. She built her experience in the hotel, restaurant, beauty, and lifestyle industries. She knows that good social media is a mix of aesthetics, psychology, humor, and a well-judged amount of madness. Plus analytics, obviously.',
      photo: '/o-nas/slider/agnieszka-klajbert.png',
    },
    {
      given: 'KATARZYNA',
      surname: 'KAPTUR',
      role: 'Social Media Expert',
      bio: 'Over four years in marketing, and at Social Lama she creates engaging content and helps brands build a coherent, strong presence online. She pairs a Communication Management background with a creative approach to content, treating every brief as room for something unconventional.',
      photo: '/o-nas/slider/katarzyna-kaptur.png',
    },
    {
      given: 'OLIWIA',
      surname: 'WITEWSKA',
      role: 'Social Media Specialist',
      bio: 'For over 10 years she has run brand communication on social media, building her experience on projects for global names in beauty, FMCG, home appliances, and lifestyle. She builds long-range strategies and engaging content, backing authenticity, emotion, and lasting relationships between a brand and its audience.',
      photo: '/o-nas/slider/oliwia-witewska.png',
    },
    {
      given: 'KAROLINA',
      surname: 'MARCINOWSKA',
      role: 'Video Content Creator',
      bio: 'At Social Lama she is responsible above all for video content — from concept, through the shoot, to the edit and the fit with brand strategy. She pairs experience running communication across sectors with a feel for trends and aesthetics, making video that earns attention and builds engagement.',
      photo: '/o-nas/slider/karolina-marcinowska.png',
    },
    {
      given: 'WOJTEK',
      surname: 'SOCHACZYŃSKI',
      role: 'Senior Videographer',
      bio: 'He runs video from idea to final export — concept, shoot, edit, color, and sound. At Social Lama he owns the footage that has to work on social: stop the thumb in the first seconds and hold attention to the end. On set he backs solid preparation; in the edit, rhythm — so the story carries itself and the brand sticks.',
      photo: '/o-nas/slider/wojtek-sochaczynski.png',
    },
    {
      given: 'ALEKSANDER',
      surname: 'DYMIŃSKI',
      role: 'Videographer',
      bio: 'He shoots and edits the content that keeps brand communication moving on social — from fast short-form to longer image pieces. He minds every stage of production: light, framing, and sound on set, then pace, cuts, and detail in the edit. He believes good video is craft paired with a feel for what genuinely hooks an audience.',
      photo: '/o-nas/slider/aleksander-dyminski.png',
    },
    {
      given: 'IZA',
      surname: 'HARMOZA-SOCHOŃ',
      role: 'HR & Administration Manager',
      bio: 'Since 2020 she has kept work running smoothly and well organized, supporting project teams and building the kind of relationships that make collaboration comfortable — for the team and clients alike.',
      photo: '/o-nas/slider/iza-harmoza-sochon.png',
    },
    {
      given: 'PRZEMYSŁAW',
      surname: 'ŚWIERCZ',
      role: 'Fullstack Developer',
      bio: "He owns the development and upkeep of the Social Lama site — frontend, backend, performance, and deploys. He also builds the internal tools and automations that shorten the team's path from idea to release. Off the clock he writes a technical blog. Outside work he likes to keep moving — cycling, running, martial arts back in the day.",
      link: { label: 'imcurious.how', href: 'https://imcurious.how' },
      photo: '/o-nas/slider/przemyslaw-swiercz.png',
    },
  ],
} satisfies LocalizedONas['oNasTeam']

/** EN homepage team-grid projection — same derivation as the PL module's. */
export const oNasTeamGrid = toTeamGrid(oNasTeam.members)
