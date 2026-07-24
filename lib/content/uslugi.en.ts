/**
 * English service list + page content — the EN twin of `uslugi.ts`.
 *
 * Each export `satisfies LocalizedUslugi['<key>']`, so a missing or mis-shaped
 * translation fails the build (the parity gate). Order, section sequences,
 * icons, cube/dashboard assets, and case-study slugs mirror the Polish module;
 * `slug` holds the clean English form under `/en/services/*`, `pairSlug` the
 * Polish slug, and `id` the stable locale-neutral key (= the Polish slug).
 * Voice: playful but clean, American spelling (established EN locale voice).
 * Copy status: DRAFT, pending user review — mirrors `uslugi.ts`.
 */

import type { LocalizedUslugi } from '@/lib/content/uslugi'

// —— Shared chrome copy ————————————————————————————————————————————————————————

export const chrome = {
  sectionLabel: 'SERVICES',
  relatedKicker: 'READ NEXT',
  proofCta: 'VIEW CASE STUDY',
  partnerKicker: 'PART OF THE GOOD ONE GROUP',
  ctaEyebrow: 'Your move',
  ctaHeadline: "Let's do this together",
  ctaText: "Tell us about your challenge — we'll show you how we can help.",
  ctaButton: 'Free consultation',
  ctaHref: '/en/contact',
  index: {
    title: 'Services',
    intro:
      'From strategy to sales — the full spectrum of social media work. Pick the area where we can help your brand.',
    cardCta: 'Learn more',
  },
} satisfies LocalizedUslugi['chrome']

// —— Canonical list (same order + sequences as uslugi.ts) ——————————————————————

export const SERVICES = [
  // 1 — Strategy
  {
    id: 'strategia',
    slug: 'strategy',
    pairSlug: 'strategia',
    label: 'Strategy',
    meta: {
      title: 'Social media strategy | Social Lama',
      description:
        'We build a data-driven social media communication strategy — from the audit and target audience to measurable goals and rollout.',
    },
    summary:
      'The starting point of every partnership — a plan built on data, not on a hunch.',
    sections: [
      {
        kind: 'hero',
        title: 'Strategy',
        intro:
          'Strategy is our starting point: we get to know your needs and possibilities, your target audience, and your brand values and character in order to build effective communication on social media. On that basis we set measurable goals, pick the right tools, and follow the plan through.',
      },
      {
        kind: 'triptych',
        kicker: 'HOW WE WORK',
        items: [
          {
            icon: 'Search',
            title: 'Audit',
            body: 'We analyze your social presence, your competitors, and your audience. We start from hard data, not assumptions.',
          },
          {
            icon: 'Compass',
            title: 'Strategy',
            body: 'We set measurable goals and choose the platforms, formats, and tone of voice. The result is a plan you can actually hold to account.',
          },
          {
            icon: 'Rocket',
            title: 'Rollout',
            body: 'We execute the plan, monitor as we go, and report regularly. The strategy stays alive and responds to the data.',
          },
        ],
      },
      {
        kind: 'proof',
        kicker: 'PROOF',
        heading: 'Strategy that worked',
        cases: [
          {
            slug: 'volvo',
            logo: '/case-studies/volvo/volvo-logo.png',
            kicker: 'CASE STUDY',
            title:
              'Building the Volvo brands on LinkedIn, Facebook, and Instagram',
          },
        ],
      },
    ],
  },

  // 2 — Content
  {
    id: 'content',
    slug: 'content',
    pairSlug: 'content',
    label: 'Content',
    meta: {
      title: 'Content & social media management | Social Lama',
      description:
        'We run brands on seven platforms — Facebook, Instagram, TikTok, X, LinkedIn, Pinterest, YouTube. Content tailored to every channel.',
    },
    summary:
      'Running your profiles with content tailored to the quirks of each platform.',
    sections: [
      {
        kind: 'hero',
        title: 'Content',
        intro:
          'Every platform plays by its own rules — a different format, a different language, a different audience. We craft content tuned to each channel and build a consistent brand presence right where your audience already is.',
      },
      {
        kind: 'platforms',
        items: [
          {
            platform: 'facebook',
            name: 'Facebook',
            copy: 'We build community and keep a steady line to your audience — from engaging posts to community management and group conversations.',
            cube: '/assets/cube-facebook-70862a.png',
          },
          {
            platform: 'instagram',
            name: 'Instagram',
            copy: 'An aesthetic feed, reels, and stories that build desire around the brand. We pair a consistent look with formats that drive reach.',
            cube: '/assets/cube-instagram.png',
          },
          {
            platform: 'tiktok',
            name: 'TikTok',
            copy: 'Short video, trends, and real-time marketing. We make content that speaks the language of the platform and genuinely spreads.',
            cube: '/assets/cube-tiktok.png',
          },
          {
            platform: 'x',
            name: 'X',
            copy: 'Fast, reactive communication and building an expert brand voice in real time.',
            cube: '/assets/cube-x-5d9863.png',
          },
          {
            platform: 'linkedin',
            name: 'LinkedIn',
            copy: 'Expert personal branding and B2B communication that builds authority and real business relationships.',
            cube: '/assets/cube-linkedin.png',
          },
          {
            platform: 'pinterest',
            name: 'Pinterest',
            copy: 'Content that lives long and drives traffic — inspiration, how-tos, and visual collections built around search intent.',
            cube: '/assets/cube-pinterest-6e33ed.png',
          },
          {
            platform: 'youtube',
            name: 'YouTube',
            copy: 'Long and short video that build subscribers and position the brand as a source of knowledge in its category.',
            cube: '/assets/cube-youtube.png',
          },
        ],
      },
    ],
  },

  // 3 — Sales
  {
    id: 'sprzedaz',
    slug: 'sales',
    pairSlug: 'sprzedaz',
    label: 'Sales',
    meta: {
      title: 'Social media that sells | Social Lama',
      description:
        'We run social media built for sales. We measure success not in likes but in your business results — backed by hard campaign data.',
    },
    summary:
      'Communication held to account for what matters most — selling products and services.',
    sections: [
      {
        kind: 'hero',
        title: 'Sales',
        intro:
          "As we build your brand's offer, we make sure communication does its most important job: selling products or services. We measure our work not only by social media metrics, but above all by the success of your business.",
      },
      {
        kind: 'triptych',
        kicker: 'HOW WE SELL',
        items: [
          {
            icon: 'Target',
            title: 'Goal',
            body: 'We start from a concrete business goal — sales, leads, traffic — and shape the whole of communication around it.',
          },
          {
            icon: 'ShoppingCart',
            title: 'Campaign',
            body: 'We combine organic content with paid campaigns, reaching the right people at the right moment in the buying journey.',
          },
          {
            icon: 'BarChart3',
            title: 'Result',
            body: 'We measure, optimize, and report. What counts is what happens after the click — not reach for its own sake.',
          },
        ],
      },
      {
        kind: 'platforms',
        items: [
          {
            platform: 'facebook',
            name: 'Meta Ads',
            copy: 'Sales campaigns across the Meta ecosystem — precise targeting held to account for real conversion.',
            dashboard: {
              src: '/assets/sprzedaz-meta-ads.png',
              alt: 'Meta Ads Manager — sales campaign results',
              width: 1350,
              height: 1080,
            },
          },
          {
            platform: 'x',
            name: 'X',
            copy: 'Growth in impressions and engagement turned into traffic and brand awareness.',
            dashboard: {
              src: '/assets/sprzedaz-x.png',
              alt: 'X analytics — growth in impressions and engagement',
              width: 1350,
              height: 1080,
            },
          },
          {
            platform: 'tiktok',
            name: 'TikTok',
            copy: 'View and follower stats that climb alongside the reach of sales-focused video campaigns.',
            dashboard: {
              src: '/assets/sprzedaz-tiktok.png',
              alt: 'TikTok Studio — view and follower statistics',
              width: 1350,
              height: 1080,
            },
          },
          {
            platform: 'youtube',
            name: 'YouTube',
            copy: 'Growth in views and subscribers that builds a lasting brand presence in video.',
            dashboard: {
              src: '/assets/sprzedaz-youtube.png',
              alt: 'YouTube channel statistics — growth in views',
              width: 1350,
              height: 1080,
            },
          },
          {
            platform: 'linkedin',
            name: 'LinkedIn',
            copy: 'Growth in company-page visits and followers that translates into B2B relationships.',
            dashboard: {
              src: '/assets/sprzedaz-linkedin.png',
              alt: 'LinkedIn page analytics — growth in visits and followers',
              width: 1350,
              height: 1080,
            },
          },
          {
            platform: 'instagram',
            name: 'Instagram',
            copy: 'Growth in reach and followers that turns attention into real traffic to your site.',
            dashboard: {
              src: '/assets/sprzedaz-instagram.png',
              alt: 'Instagram statistics — growth in reach and followers',
              width: 900,
              height: 1117,
            },
          },
        ],
      },
      {
        kind: 'proof',
        kicker: 'PROOF',
        heading: 'Results that speak for themselves',
        cases: [
          {
            slug: 'irobot',
            logo: '/case-studies/irobot/irobot-logo.png',
            kicker: 'CASE STUDY',
            title:
              'iRobot — humor and education that build a brand on YouTube and TikTok',
          },
        ],
      },
    ],
  },

  // 4 — Creative & Video
  {
    id: 'kreacje-wideo',
    slug: 'creative-video',
    pairSlug: 'kreacje-wideo',
    label: 'Creative & Video',
    meta: {
      title: 'Graphic creative & video | Social Lama',
      description:
        'Graphics, video, reels, and animation — the full spectrum of social media creative. Deep video and copywriting resources, tuned to the trends.',
    },
    summary:
      'The full spectrum of creative — from graphics and copy to video and animation.',
    sections: [
      {
        kind: 'hero',
        title: 'Creative & Video',
        intro:
          'Graphics, carousels, infographics, reels, animation, visualizations — deep video and copywriting resources let us offer the full spectrum of social media creative. We keep the messages varied and tuned to the trends and preferences of your audience.',
      },
      {
        kind: 'triptych',
        kicker: 'WHAT WE MAKE',
        items: [
          {
            icon: 'PenTool',
            title: 'Graphic support',
            body: 'Posts, carousels, infographics, and key visuals — a consistent visual system that sets the brand apart in the feed.',
          },
          {
            icon: 'Video',
            title: 'Video production',
            body: 'From concept through shoot to edit. Reels, ads, and native formats filmed with the platform in mind.',
          },
          {
            icon: 'Sparkles',
            title: 'Animation',
            body: 'Motion design and animation that give brands movement — from simple bumpers to full-scale visualizations.',
          },
        ],
      },
      {
        kind: 'partner',
        partner: 'diea',
        name: 'Diea',
        logo: '/assets/diea-logo-light.png',
        tagline: 'from idea to Design',
        copy: 'Our biggest video productions are made with DIEA — a production studio from the Good One group. Full equipment and production resources let us take on projects of any scale.',
        href: '/en/contact',
        video: {
          src: '/clips/diea-showreel.mp4',
          mobileSrc: '/clips/diea-showreel-mobile.mp4',
          poster: '/clips/diea-showreel-poster.jpg',
          alt: 'DIEA 2025 video showreel — advertising, event, and product work',
        },
      },
    ],
  },

  // 5 — Audit & consulting
  {
    id: 'audyt-i-konsultacje',
    slug: 'audit-consulting',
    pairSlug: 'audyt-i-konsultacje',
    label: 'Audit & consulting',
    meta: {
      title: 'Social media audit & consulting | Social Lama',
      description:
        'An audit of your social media presence and strategic consulting. Concrete findings and recommendations you can put to work right away.',
    },
    summary:
      'An outside look at your communication — concrete findings and recommendations.',
    sections: [
      {
        kind: 'hero',
        title: 'Audit & consulting',
        intro:
          "Sometimes you don't need full management, just a fresh, expert set of eyes. We analyze your social media presence and deliver concrete findings and recommendations — ready to put to work, no matter who runs your channels.",
      },
      {
        kind: 'triptych',
        kicker: 'WHAT YOU GET',
        items: [
          {
            icon: 'ClipboardCheck',
            title: 'Audit',
            body: "A full analysis of your profiles, content, and results against the competition. No sugar-coating — we show what's working and what isn't.",
          },
          {
            icon: 'Lightbulb',
            title: 'Recommendations',
            body: 'A concrete list of recommendations ranked by impact. You know exactly what to change and why.',
          },
          {
            icon: 'MessageSquare',
            title: 'Consulting',
            body: 'A workshop or consulting session with your team — we walk through the findings and help you plan the next steps.',
          },
        ],
      },
      {
        kind: 'proof',
        kicker: 'PROOF',
        heading: 'We know what to look for',
        cases: [
          {
            slug: 'volvo',
            logo: '/case-studies/volvo/volvo-logo.png',
            kicker: 'CASE STUDY',
            title:
              'Building the Volvo brands on LinkedIn, Facebook, and Instagram',
          },
        ],
      },
    ],
  },

  // 6 — Influencer marketing
  {
    id: 'influencer-marketing',
    slug: 'influencer-marketing',
    pairSlug: 'influencer-marketing',
    label: 'Influencer marketing',
    meta: {
      title: 'Influencer marketing | Social Lama',
      description:
        'Influencer marketing campaigns — creator selection, partnership strategy, and delivery. Authentic content that builds reach and trust.',
    },
    summary:
      'Creator campaigns — from picking the right influencers to delivery and reporting.',
    sections: [
      {
        kind: 'hero',
        title: 'Influencer marketing',
        intro:
          "A well-chosen creator speaks to their community in its own language — and builds trust a brand can't buy on its own. We run influencer marketing campaigns from strategy and creator selection through to delivery and measuring results.",
      },
      {
        kind: 'triptych',
        kicker: 'HOW WE WORK',
        items: [
          {
            icon: 'Users',
            title: 'Creator selection',
            body: 'We pick influencers by brand fit and real community engagement — not by follower count alone.',
          },
          {
            icon: 'Megaphone',
            title: 'Campaign',
            body: 'We shape the partnership strategy, brief the creators, and make sure the content is authentic and on-brand.',
          },
          {
            icon: 'HeartHandshake',
            title: 'Relationships',
            body: 'We build long-term relationships with creators — recurring collaborations work better than one-off pushes.',
          },
        ],
      },
      {
        kind: 'partner',
        partner: 'folks',
        name: 'Folks',
        logo: '/assets/folks-logo-light.png',
        tagline: 'from creators to results',
        copy: 'On influencer campaigns we work with Folks — an influencer marketing agency from the Good One group. Access to a creator network and experience with campaigns of any scale.',
        href: '/en/contact',
        video: {
          src: '/clips/folks-cover.mp4',
          mobileSrc: '/clips/folks-cover-mobile.mp4',
          poster: '/clips/folks-cover-poster.jpg',
          alt: 'Content creator filming with a ring light',
        },
      },
      {
        kind: 'proof',
        kicker: 'PROOF',
        heading: 'Creators who deliver',
        cases: [
          {
            slug: 'pracuj-pl',
            logo: '/case-studies/pracuj-pl/pracuj-pl-logo.png',
            kicker: 'CASE STUDY',
            title: 'Pracuj.pl — humor, creators, and an AR filter on TikTok',
          },
        ],
      },
    ],
  },
] satisfies LocalizedUslugi['services']

// —— Derived navigation ————————————————————————————————————————————————————————

export const serviceNav = SERVICES.map((service) => ({
  label: service.label,
  href: `/en/services/${service.slug}`,
}))

/** Lookup by this-locale (English) slug. Returns the widened EN service. */
export function findService(slug: string) {
  return SERVICES.find((service) => service.slug === slug)
}
