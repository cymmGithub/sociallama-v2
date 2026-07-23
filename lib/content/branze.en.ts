/**
 * English industry list + page content — the EN twin of `branze.ts`.
 *
 * Each export `satisfies LocalizedBranze['<key>']`, so a missing or mis-shaped
 * translation fails the build (design D2). Order, variant selection (proof vs
 * editorial), and slugs mirror the Polish module; EN slugs are the clean
 * translated forms under `/en/industries/*`. Voice: playful but clean, American
 * spelling (user-approved 2026-07-22). Copy status mirrors `branze.ts`.
 */

import type { Industry, LocalizedBranze } from '@/lib/content/branze'

// —— Shared chrome copy ————————————————————————————————————————————————————————

export const chrome = {
  sectionLabel: 'INDUSTRIES',
  proof: {
    portfolioKicker: 'PORTFOLIO',
    portfolioHeading: "HERE'S HOW IT LOOKS IN THE FEED",
    realBadge: '100% REAL CREATIVE',
    caseStudyCta: 'VIEW CASE STUDY',
    ctaHeadline: 'WANT RESULTS LIKE THESE IN YOUR INDUSTRY?',
  },
  editorial: {
    manifestoKicker: 'WHY IT WORKS',
    logosKicker: 'THEY TRUSTED US',
    ctaHeadline: "LET'S TALK ABOUT YOUR BRAND.",
  },
  ctaButton: 'FREE CONSULTATION',
  ctaHref: '/en/contact',
} satisfies LocalizedBranze['chrome']

// —— Canonical list (same order + variants as branze.ts) ———————————————————————

export const INDUSTRIES = [
  // 1 — proof (Volvo)
  {
    id: 'automotive',
    slug: 'automotive',
    pairSlug: 'automotive',
    label: 'Automotive',
    meta: {
      title: 'Social media for the automotive industry | Social Lama',
      description:
        'We run social media for automotive brands — from premium showrooms to electric mobility. See how we built the Volvo Car Warszawa and Dom Volvo communities.',
    },
    tagline:
      "We don't tell you how we do social media for automotive. We show you — everything below is real material from our own profiles.",
    chips: [
      { value: '3+', label: 'years of continuous work with the Volvo brand' },
      { value: '2', label: 'brands run in parallel — VCW & Dom Volvo' },
      { value: '3', label: 'platforms: LinkedIn, Facebook, Instagram' },
    ],
    caseStudy: {
      slug: 'volvo',
      cardKicker: 'CASE STUDY',
      cardTitle:
        'Building the Volvo brands on LinkedIn, Facebook, and Instagram',
      creatives: [
        {
          src: '/case-studies/volvo/volvo-vcw-post.jpg',
          alt: 'Volvo Car Warszawa Instagram post featuring a Volvo car',
        },
        {
          src: '/case-studies/volvo/volvo-vcw-goracy.jpg',
          alt: 'Volvo "Hot season?" creative about prepping the car for summer',
        },
        {
          src: '/case-studies/volvo/volvo-event-ex30.jpg',
          alt: 'The electric Volvo EX30 shown at an outdoor event',
        },
        {
          src: '/case-studies/volvo/volvo-event-noc.jpg',
          alt: 'Museum Night coverage at the Volvo showroom — a concert in moody lighting',
        },
        {
          src: '/case-studies/volvo/volvo-dom-savedate.jpg',
          alt: '"Save the date" creative — open days at Dom Volvo',
        },
      ],
      quote: {
        text: "Personal branding for advisors and expert content built both brands' positions on LinkedIn — without buying reach.",
        attribution: 'Volvo Car Warszawa & Dom Volvo',
      },
    },
  },

  // 2 — proof (iRobot)
  {
    id: 'elektronika-i-agd',
    slug: 'electronics',
    pairSlug: 'elektronika-i-agd',
    label: 'Electronics & Appliances',
    meta: {
      title:
        'Social media for the electronics & appliances industry | Social Lama',
      description:
        'We run social media for electronics and home-appliance brands — from product education to viral content. See how iRobot took over TikTok and YouTube.',
    },
    tagline:
      "We don't tell you how we do social media for electronics and appliances. We show you — everything below is real creative from our campaigns.",
    chips: [
      { value: '11M', label: 'views on TikTok' },
      { value: '742k', label: 'views on YouTube' },
      { value: '+7.9k', label: 'new subscribers on YouTube' },
    ],
    caseStudy: {
      slug: 'irobot',
      cardKicker: 'CASE STUDY',
      cardTitle:
        'iRobot — humor and education that build a brand on YouTube and TikTok',
      creatives: [
        {
          src: '/case-studies/irobot/irobot-gallery-1.jpg',
          alt: 'iRobot social media campaign creative',
        },
        {
          src: '/case-studies/irobot/irobot-gallery-2.jpg',
          alt: 'iRobot social media campaign creative',
        },
        {
          src: '/case-studies/irobot/irobot-gallery-3.jpg',
          alt: 'iRobot social media campaign creative',
        },
        {
          src: '/case-studies/irobot/irobot-gallery-4.jpg',
          alt: 'iRobot social media campaign creative',
        },
        {
          src: '/case-studies/irobot/irobot-gallery-5.jpg',
          alt: 'iRobot social media campaign creative',
        },
      ],
      quote: {
        text: 'Bold, educational content made the iRobot brand genuinely come alive on social — without artificially inflating reach.',
        attribution: 'iRobot',
      },
    },
  },

  // 3 — editorial
  {
    id: 'beauty',
    slug: 'beauty',
    pairSlug: 'beauty',
    label: 'Beauty',
    meta: {
      title: 'Social media for the beauty industry | Social Lama',
      description:
        'We run social media for beauty brands — skincare, makeup, care. Aesthetic content, the power of UGC, and campaigns that actually sell.',
    },
    tagline:
      'Beauty is a first-impression business. We build it where your customer forms it — in the feed. Aesthetic content and campaigns for beauty brands.',
    chips: [
      { value: 'Aesthetic', label: 'a consistent feed that builds desire' },
      { value: 'UGC', label: 'real faces, real trust' },
      { value: 'Rituals', label: 'content that slips into daily routines' },
    ],
    marquee: [
      'Skincare',
      'Makeup',
      'Care',
      'UGC',
      'Influencer marketing',
      'Rituals',
      'New drops',
    ],
    manifesto: {
      lead: 'Beauty sells in the feed.',
      rest: 'But consistent, aesthetic content and real community faces decide which brand she reaches for at the shelf.',
    },
  },

  // 4 — editorial
  {
    id: 'health',
    slug: 'health',
    pairSlug: 'health',
    label: 'Health',
    meta: {
      title: 'Social media for the health industry | Social Lama',
      description:
        'We run social media for health and wellbeing brands. Solid education, expert authority, and communication that builds trust.',
    },
    tagline:
      'Health is a trust business. We build it where people look for answers — in the feed. Educational content and campaigns for health brands.',
    chips: [
      { value: 'Expert', label: 'content vetted for accuracy' },
      { value: 'Education', label: 'tough topics in plain language' },
      { value: 'Prevention', label: 'communication that genuinely helps' },
    ],
    marquee: [
      'Wellbeing',
      'Supplements',
      'Health education',
      'Expert',
      'Prevention',
      'Trust',
      'Support',
    ],
    manifesto: {
      lead: "Health isn't sold on a promise.",
      rest: "It's sold with solid education, expert authority, and communication people trust in the decisions that matter most.",
    },
  },

  // 5 — editorial · draft copy pending review (batch 2)
  {
    id: 'finanse',
    slug: 'finance',
    pairSlug: 'finanse',
    label: 'Finance',
    meta: {
      title: 'Social media for the finance industry | Social Lama',
      description:
        'We run social media for finance and fintech brands. Jargon-free education, authority, and communication people trust with their money.',
    },
    tagline:
      'Finance is trust in its purest form. We build it with clear, everyday communication for finance and fintech brands.',
    chips: [
      { value: 'B2B & B2C', label: 'communication tuned to the audience' },
      { value: 'Education', label: 'finance without the jargon' },
      { value: 'Trust', label: 'the foundation of every decision' },
    ],
    marquee: [
      'Fintech',
      'Payments',
      'Financial education',
      'B2B',
      'Security',
      'Investing',
      'Trust',
    ],
    manifesto: {
      lead: "Money isn't handed to chance.",
      rest: "It's handed to a brand that explains hard topics in plain language and earns trust every day.",
    },
  },

  // 6 — editorial · draft copy pending review (batch 2)
  {
    id: 'petcare',
    slug: 'pet',
    pairSlug: 'petcare',
    label: 'Pet Industry',
    meta: {
      title: 'Social media for the pet industry | Social Lama',
      description:
        'We run social media for pet and petcare brands. Loyal owner communities, how-to content, and real sales.',
    },
    tagline:
      'The pet industry runs on emotion and loyalty. We build owner communities where a pet is family — and treat the brands the same way.',
    chips: [
      { value: 'Community', label: 'the most loyal audiences on social' },
      { value: 'How-tos', label: 'content they come back for' },
      { value: 'Emotion', label: 'a pet is family' },
    ],
    marquee: [
      'Petcare',
      'Food',
      'Accessories',
      'Community',
      'How-tos',
      'Adoptions',
      'Animal love',
    ],
    manifesto: {
      lead: 'To an owner, it\'s not "a pet." It\'s family.',
      rest: 'Brands that get this build the most loyal communities in all of social.',
    },
  },

  // 7 — editorial · draft copy pending review (batch 2)
  {
    id: 'alkohole',
    slug: 'alcohol',
    pairSlug: 'alkohole',
    label: 'Alcohol',
    meta: {
      title: 'Social media for the alcohol industry | Social Lama',
      description:
        'We run social media for alcohol brands — wine, craft beer, spirits. An aspirational image that respects regulations and responsible drinking.',
    },
    tagline:
      'Alcohol is a business of ritual and occasion. We build brands an aspirational image — with a feel for regulations and responsible drinking.',
    chips: [
      { value: 'Regulations', label: 'communication that stays compliant' },
      { value: 'Ritual', label: 'a brand woven into the moment' },
      { value: 'Aspiration', label: 'a premium image' },
    ],
    marquee: [
      'Wine',
      'Craft beer',
      'Spirits',
      'Ritual',
      'Occasions',
      'Tastings',
      'Responsible drinking',
    ],
    manifesto: {
      lead: 'Alcohol plays by its own rules.',
      rest: 'Regulations, timing, and ritual — you have to feel all three to build an aspirational brand.',
    },
  },

  // 8 — editorial · draft copy pending review (batch 2)
  {
    id: 'fashion',
    slug: 'fashion',
    pairSlug: 'fashion',
    label: 'Fashion',
    meta: {
      title: 'Social media for the fashion industry | Social Lama',
      description:
        'We run social media for fashion brands. We build desire around drops and collections, pair lookbooks with UGC, and turn followers into customers.',
    },
    tagline:
      'Fashion is a business of pace. We give brands the rhythm of the feed — building desire around drops and collections, season after season.',
    chips: [
      { value: 'Trends', label: 'a brand always on time' },
      { value: 'Drop', label: 'the tension that sells' },
      { value: 'UGC', label: 'style, styled by the community' },
    ],
    marquee: [
      'Fashion',
      'Trends',
      'Lookbook',
      'Drop',
      'UGC',
      'Collections',
      'Style',
    ],
    manifesto: {
      lead: 'Fashion moves faster than the feed.',
      rest: 'The winners set the pace — building desire around drops and turning followers into customers.',
    },
  },

  // 9 — editorial · draft copy pending review (batch 3)
  {
    id: 'horeca',
    slug: 'horeca',
    pairSlug: 'horeca',
    label: 'Horeca',
    meta: {
      title: 'Social media for the HoReCa industry | Social Lama',
      description:
        'We run social media for restaurants, cafés, and bars. Mouth-watering food content, building a sense of place, and communication that fills tables.',
    },
    tagline:
      'HoReCa is an appetite business. We spark it where hunger starts — in the feed. Food content and communication that fills tables.',
    chips: [
      { value: 'Food content', label: 'photos you can practically taste' },
      { value: 'Atmosphere', label: 'a place worth coming back to' },
      { value: 'Reservations', label: 'a feed that fills tables' },
    ],
    marquee: [
      'Restaurants',
      'Cafés',
      'Menu',
      'Food content',
      'Reservations',
      'Atmosphere',
      'Occasions',
    ],
    manifesto: {
      lead: 'Hunger starts in the feed.',
      rest: 'Before a guest crosses the threshold, appetizing content and a sense of place are already filling tables.',
    },
  },

  // 10 — editorial · draft copy pending review (batch 3)
  {
    id: 'hotele-i-miejsca-wypoczynkowe',
    slug: 'hospitality',
    pairSlug: 'hotele-i-miejsca-wypoczynkowe',
    label: 'Hotels & Resorts',
    meta: {
      title: 'Social media for hotels and resorts | Social Lama',
      description:
        'We run social media for hotels, resorts, and spas. Aspirational travel content and communication that turns a scroll into a booking.',
    },
    tagline:
      'Leisure is a business of dreams. We sell them before a guest packs a bag — aspirational travel content for hotels and resorts.',
    chips: [
      { value: 'Aspiration', label: 'a place worth dreaming about' },
      { value: 'Booking', label: 'content that drives reservations' },
      { value: 'Seasons', label: 'communication all year round' },
    ],
    marquee: [
      'Hotels',
      'Resorts',
      'Spa',
      'Leisure',
      'Travel content',
      'Reservations',
      'Experience',
    ],
    manifesto: {
      lead: 'A vacation is bought on a dream.',
      rest: 'Aspirational travel content sells the place before a guest even packs a bag.',
    },
  },

  // 11 — editorial · draft copy pending review (batch 3)
  {
    id: 'nieruchomosci-i-deweloperzy',
    slug: 'real-estate',
    pairSlug: 'nieruchomosci-i-deweloperzy',
    label: 'Real Estate & Developers',
    meta: {
      title: 'Social media for the real estate industry | Social Lama',
      description:
        'We run social media for developers and real-estate brands. Presenting investments, building trust, and communication that generates leads.',
    },
    tagline:
      'Real estate is a business of the biggest purchase there is. We build the trust that comes before it — and communication that generates leads.',
    chips: [
      { value: 'Leads', label: 'communication built for contact' },
      { value: 'Renderings', label: 'an investment you can see' },
      { value: 'Trust', label: 'the foundation of a life decision' },
    ],
    marquee: [
      'Developers',
      'Investments',
      'Apartments',
      'Renderings',
      'Location',
      'Leads',
      'Trust',
    ],
    manifesto: {
      lead: 'Buying property is a life decision.',
      rest: "It's preceded by trust — we build it by presenting investments and communication that generates real leads.",
    },
  },

  // 12 — editorial · draft copy pending review (batch 3)
  {
    id: 'rozrywka',
    slug: 'entertainment',
    pairSlug: 'rozrywka',
    label: 'Entertainment',
    meta: {
      title: 'Social media for the entertainment industry | Social Lama',
      description:
        'We run social media for entertainment brands — events, culture, premieres. We build hype, activate the community, and create content that lives in the comments.',
    },
    tagline:
      'Entertainment is a business of fighting for attention. We win it with content — building hype around premieres and events, and activating the community.',
    chips: [
      { value: 'Hype', label: 'the buzz before a premiere' },
      { value: 'Community', label: 'an audience that co-creates' },
      { value: 'Engagement', label: 'content people share' },
    ],
    marquee: [
      'Events',
      'Culture',
      'Premieres',
      'Community',
      'Engagement',
      'Emotion',
      'Live',
    ],
    manifesto: {
      lead: 'Attention is the currency of entertainment.',
      rest: 'We build hype around premieres, activate the community, and create content that lives in the comments.',
    },
  },
] satisfies LocalizedBranze['industries']

// —— Derived navigation (EN — /en/industries/<slug>) ———————————————————————————
export const industryNav = INDUSTRIES.map((industry) => ({
  label: industry.label,
  href: `/en/industries/${industry.slug}`,
}))

/** Lookup by EN slug (route params → page content). */
export function findIndustry(slug: string): Industry | undefined {
  return INDUSTRIES.find((industry) => industry.slug === slug)
}
