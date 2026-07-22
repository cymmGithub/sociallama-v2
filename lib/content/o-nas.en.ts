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

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.'

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
  headingLead: 'Completed',
  headingRest: 'projects',
  items: [
    {
      name: 'PROJECT NAME',
      year: '2025',
      client: 'CLIENT BRAND NAME',
      image: '',
    },
    {
      name: 'PROJECT NAME',
      year: '2025',
      client: 'CLIENT BRAND NAME',
      image: '',
    },
    {
      name: 'PROJECT NAME',
      year: '2025',
      client: 'CLIENT BRAND NAME',
      image: '',
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
      bio: LOREM,
      photo: '/o-nas/slider/anna-ozga.png',
    },
    {
      given: 'PIOTREK',
      surname: 'ZACH',
      role: 'Project Manager',
      bio: LOREM,
      photo: '/o-nas/slider/piotr-zach.png',
    },
    {
      given: 'KAROLINA',
      surname: 'MARCINOWSKA',
      role: 'Video Content Creator',
      bio: LOREM,
      photo: '/o-nas/slider/karolina-marcinowska.png',
    },
  ],
} satisfies LocalizedONas['oNasTeam']
