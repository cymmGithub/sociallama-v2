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
  briefKicker: 'WHY IT WORKS',
  proof: {
    portfolioKicker: 'PORTFOLIO',
    portfolioHeading: "HERE'S HOW IT LOOKS IN THE FEED",
    realBadge: '100% REAL CREATIVE',
    caseStudyCta: 'VIEW CASE STUDY',
    ctaHeadline: 'Want results like these in your industry?',
  },
  editorial: {
    manifestoKicker: 'OUR APPROACH',
    ctaHeadline: "Let's talk about your brand",
  },
  related: {
    kicker: 'MORE PROOF',
    headingAccent: 'OTHER',
    heading: 'CASE STUDIES FROM THIS INDUSTRY',
    cta: 'VIEW CASE STUDY',
  },
  ctaText: "Tell us about your challenge — we'll show you how we can help.",
  ctaButton: "Let's talk about your business",
  ctaHref: '/en/contact',
  index: {
    title: 'Industries',
    intro:
      'Every industry has its own language, its own pace, its own audience. Find yours and see how we run social there.',
    cardCta: 'More',
  },
} satisfies LocalizedBranze['chrome']

// —— Canonical list (same order + variants as branze.ts) ———————————————————————

export const INDUSTRIES = [
  // 1 — proof (Volvo)
  {
    id: 'automotive',
    slug: 'automotive',
    pairSlug: 'automotive',
    label: 'Automotive',
    // Imagery: Pexels (free license) — photo IDs 5864155, 10800215, 8349487.
    collage: [
      {
        src: '/branze/automotive/automotive-1.jpg',
        alt: 'An illuminated car showroom at night',
      },
    ],
    relatedCaseStudies: [
      {
        slug: 'motointegrator',
        title: 'Automotive e-commerce expanding into new markets',
      },
      {
        slug: 'ozgasl',
        title: 'A family automotive business on TikTok',
      },
      {
        slug: 'a1-karting',
        title: 'Karting and motorsport on social media',
      },
    ],
    meta: {
      title: 'Social media for the automotive industry',
      description:
        'We run social media for automotive brands — from premium showrooms to electric mobility. See how we built the Volvo Car Warszawa and Dom Volvo communities.',
    },
    tagline:
      "We don't tell you how we do social media for automotive. We show you — everything below is real material from our own profiles.",
    brief: {
      pillars: [
        'Expert communication',
        'Technology & innovation',
        'Expert personal branding',
      ],
      paragraphs: [
        {
          text: 'Automotive is a category where buying decisions follow a long process of researching and comparing the options. On social, what matters most is expertise, credibility, and the ability to explain advanced technology in plain terms.',
          strong:
            'what matters most is expertise, credibility, and the ability to explain advanced technology in plain terms.',
        },
        {
          text: 'Per Deloitte’s “2025 Global Automotive Consumer Study,” 69% of Polish consumers planning a car purchase say they actively research online before deciding. So we build communication that combines expert knowledge, engaging storytelling, and compelling video formats — helping brands build trust and long-term relationships with their audience.',
        },
      ],
    },
    numbers: [
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
          src: '/case-studies/volvo/volvo-gallery-3.jpg',
          alt: 'Volvo creative with a woman by the sea, hair in the wind, headlined "A hot spell? Take it cool"',
          width: 1068,
          height: 1350,
        },
        {
          src: '/case-studies/volvo/volvo-gallery-1.jpg',
          alt: 'Volvo Car Warszawa creative showing the glass Dom Volvo showroom, announcing Midsommar open days on 25 to 27 June and the Volvo XC60 launch',
          width: 1080,
          height: 1350,
        },
        {
          src: '/case-studies/volvo/volvo-event-ex30.jpg',
          alt: 'The electric Volvo EX30 shown at an outdoor event',
          width: 406,
          height: 720,
        },
        {
          src: '/case-studies/volvo/volvo-event-noc.jpg',
          alt: 'Museum Night coverage at the Volvo showroom, a concert in moody lighting',
          width: 406,
          height: 720,
        },
        {
          src: '/case-studies/volvo/volvo-gallery-4.jpg',
          alt: 'Volvo contest creative with children drawing at a table, headlined "Volvo as a child sees it", inviting visitors to the exhibition at Dom Volvo on 25 to 27 June',
          width: 1079,
          height: 1350,
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
    // Imagery: Pexels (free license) — photo IDs 844874, 7533923, 29292011.
    collage: [
      {
        src: '/branze/elektronika-i-agd/elektronika-i-agd-1.jpg',
        alt: 'A robot vacuum on a wooden floor',
      },
    ],
    relatedCaseStudies: [
      {
        slug: 'vobis',
        title: 'Real-time marketing for a consumer electronics brand',
      },
      {
        slug: 'asus',
        title: 'An educational campaign about ASUS AI',
      },
      {
        slug: 'breville',
        title: 'Content marketing for small appliances',
      },
      {
        slug: 'kohersen',
        title: 'Cookware for everyday cooking',
      },
      {
        slug: 'stadler-form',
        title: 'Clean air, TikTok style',
      },
      {
        slug: 'laurastar',
        title: 'Premium appliances and educational content',
      },
      {
        slug: 'foodsaver',
        title: 'Zero waste with vacuum sealers',
      },
    ],
    meta: {
      title: 'Social media for the electronics & appliances industry',
      description:
        'We run social media for electronics and home-appliance brands — from product education to viral content. See how iRobot took over TikTok and YouTube.',
    },
    tagline:
      "We don't tell you how we do social media for electronics and appliances. We show you — everything below is real creative from our campaigns.",
    brief: {
      pillars: [
        'Product education',
        'Video content',
        'Turning tech into real benefits',
      ],
      paragraphs: [
        {
          text: 'Electronics and appliances is a category where consumers want more than inspiration — they want concrete information that makes the buying decision easier. On social, the key roles are education, showing off functionality, and demonstrating real everyday uses of the product.',
          strong:
            'the key roles are education, showing off functionality, and demonstrating real everyday uses of the product.',
        },
        {
          text: 'Per the Gemius “E-commerce in Poland 2025” report, 75% of Polish internet users shop online, and electronics and appliances are among the most-purchased categories. That means brands here should lean into accessible communication, compelling video formats, and content that helps people understand the tech and choose the right product with confidence.',
        },
      ],
    },
    numbers: [
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
          src: '/case-studies/irobot/irobot-humor-parrot.jpg',
          alt: 'Frame from an iRobot humor video, a green parrot indoors with the green iRobot mark over the centre',
          width: 713,
          height: 640,
        },
        {
          src: '/case-studies/irobot/irobot-edukacja-1.png',
          alt: 'iRobot creative asking whether dogs get stressed by vacuuming',
          width: 820,
          height: 1320,
        },
        {
          src: '/case-studies/irobot/irobot-edukacja-2-cut.webp?v=2',
          alt: 'iRobot Polska post introducing the Roomba MAX 775 Combo',
          width: 814,
          height: 1316,
        },
        {
          src: '/case-studies/irobot/irobot-innowacja-1.png',
          alt: 'Frame from the "Find Your Roomba" YouTube video about a robot for dog owners',
          width: 2056,
          height: 1164,
        },
      ],
      // Translation of the verbatim PL testimonial in `branze.ts`.
      quote: {
        text: 'We have worked with Social Lama on TikTok and YouTube for close to two years, and we recommend them without reservation. The team stands out for its knowledge and expertise, and for treating us as true partners — we can always count on their commitment, responsive communication, and real support in reaching our goals.',
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
    // Numbers verbatim from the Kontigo case study.
    numbers: [
      { value: '1 100', label: 'Ambassadors gathered' },
      { value: '79', label: 'Avg. monthly posts from ambassadors' },
      { value: '1 500', label: 'Avg. monthly likes on group posts' },
    ],
    caseStudy: {
      slug: 'kontigo',
      cardKicker: 'CASE STUDY',
      cardTitle: '#KontigoCLUB — a community of brand ambassadors',
      creatives: [
        {
          src: '/case-studies/kontigo/kontigo-gallery-1.jpg',
          alt: '#KontigoCLUB creative with the tagline "Get a -20% code for all brands!"',
          width: 1080,
          height: 1080,
        },
        {
          src: '/case-studies/kontigo/kontigo-gallery-2.jpg',
          alt: 'Screenshot of the #KontigoCLUB group welcome message with the hashtag rules and the Top 3 Ambassadors contest terms',
          width: 345,
          height: 713,
        },
        {
          src: '/case-studies/kontigo/kontigo-gallery-3.jpg',
          alt: '#KontigoCLUB graphic captioned "Group rules", framed by tropical leaves and hibiscus flowers',
          width: 1080,
          height: 1080,
        },
        {
          src: '/case-studies/kontigo/kontigo-gallery-7.jpg',
          alt: 'Graphic "Top 3 Ambassadors May 2023" listing the winners: Adrianna Anna, Kinga Jaromin, Nikola Lopata',
          width: 1080,
          height: 1080,
        },
        {
          src: '/case-studies/kontigo/kontigo-gallery-5.jpg',
          alt: 'Graphic "Discover the KontigoCLUB Favorite of May!" presenting the Anwen Wake It Up enzyme shampoo',
          width: 597,
          height: 1400,
        },
      ],
    },
    relatedCaseStudies: [
      {
        slug: 'luisse',
        title: 'Personal branding in the hairdressing industry',
      },
    ],
    meta: {
      title: 'Social media for the beauty industry',
      description:
        'We run social media for beauty brands — skincare, makeup, care. Aesthetic content, the power of UGC, and campaigns that actually sell.',
    },
    tagline:
      'Beauty is a first-impression business. We build it where your customer forms it — in the feed. Aesthetic content and campaigns for beauty brands.',
    brief: {
      pillars: [
        'Education & expertise',
        'UGC & influencer marketing',
        'Engaged communities',
      ],
      paragraphs: [
        {
          text: 'Beauty is one of the most competitive categories on social. Pretty content alone no longer cuts it — consumers expect authenticity, expert knowledge, and recommendations they can trust.',
        },
        {
          text: 'Per Mintel’s 2025 report, consumers increasingly base buying decisions on ingredient transparency and proven product efficacy. For beauty brands, that means a growing role for educational, expert-led communication. So we build strategies that blend education, inspiration, and engaging storytelling — helping brands earn trust and build long-term relationships with their audience.',
          strong:
            'we build strategies that blend education, inspiration, and engaging storytelling — helping brands earn trust and build long-term relationships with their audience.',
        },
      ],
    },
    chips: [
      { value: 'Aesthetic', label: 'a consistent feed that builds desire' },
      { value: 'UGC', label: 'real faces, real trust' },
      { value: 'Rituals', label: 'content that slips into daily routines' },
    ],
    manifesto: {
      lead: 'Beauty sells in the feed.',
      rest: 'But consistent, aesthetic content and real community faces decide which brand she reaches for at the shelf.',
    },
    marquee: [
      'Skincare',
      'Makeup',
      'Care',
      'UGC',
      'Influencer marketing',
      'Rituals',
      'New drops',
    ],
    collage: [
      {
        src: '/branze/beauty/beauty-1.jpg',
        alt: 'Skincare products in a minimalist arrangement',
      },
    ],
  },

  // 4 — editorial
  {
    id: 'health',
    slug: 'health',
    pairSlug: 'health',
    label: 'Health',
    /* Mirrors the PL wall file-for-file; see `branze.ts` for why it mixes brands. */
    creatives: [
      {
        src: '/case-studies/fundacja-saventic/fundacja-saventic-gallery-3.jpg',
        alt: 'Fundacja Saventic educational post "Cardiomyopathies: causes, symptoms, treatment" with an illustration of a doctor and a heart',
        width: 1400,
        height: 1400,
      },
      {
        src: '/case-studies/imid-cmv/imid-cmv-edu-1.jpg',
        alt: 'LeczenieCMV.pl campaign creative asking whether CMV is a hereditary virus',
        width: 1080,
        height: 1080,
      },
      {
        src: '/case-studies/fundacja-saventic/fundacja-saventic-gallery-2.jpg',
        alt: 'Fundacja Saventic educational post "Which diseases come with jaundice?" carrying a comment from dr hab. n. med. Patryk Lipinski',
        width: 1201,
        height: 1200,
      },
      {
        src: '/case-studies/imid-cmv/imid-cmv-walacyklowir-1.jpg',
        alt: 'LeczenieCMV.pl campaign creative asking whether to treat CMV in pregnancy with immunoglobulins or valacyclovir',
        width: 720,
        height: 720,
      },
      {
        src: '/case-studies/imid-cmv/imid-cmv-edu-2.jpg',
        alt: 'LeczenieCMV.pl campaign creative: 90% of women of childbearing age carry cytomegalovirus',
        width: 720,
        height: 720,
      },
    ],
    relatedCaseStudies: [
      {
        slug: 'imid-cmv',
        title: 'Educating patients about a CMV clinical trial',
      },
      {
        slug: 'fundacja-saventic',
        title: 'Rare diseases and health education',
      },
      {
        slug: 'mercator',
        title: 'Medical devices in B2B communication',
      },
      {
        slug: 'power-elements',
        title: 'Launching a dietary supplements brand',
      },
      {
        slug: 'mmhygienic',
        title: 'A new brand in the disinfection category',
      },
    ],
    meta: {
      title: 'Social media for the health industry',
      description:
        'We run social media for health and wellbeing brands. Solid education, expert authority, and communication that builds trust.',
    },
    tagline:
      'Health is a trust business. We build it where people look for answers — in the feed. Educational content and campaigns for health brands.',
    brief: {
      pillars: [
        'Knowledge-based education',
        'Building trust',
        'Brand reputation management',
      ],
      paragraphs: [
        {
          text: 'Health takes a special approach to communication. Audiences expect solid information, expert knowledge, and fact-based content. In a world full of misinformation, trust becomes one of a brand’s most valuable assets.',
          strong:
            'Audiences expect solid information, expert knowledge, and fact-based content.',
        },
        {
          text: 'Per the Edelman Trust Barometer 2025, 72% of respondents worry about false information and disinformation. So communication for health and wellbeing brands should rest on credible sources, transparency, and building long-term relationships with the audience.',
        },
      ],
    },
    chips: [
      { value: 'Expert', label: 'content vetted for accuracy' },
      { value: 'Education', label: 'tough topics in plain language' },
      { value: 'Prevention', label: 'communication that genuinely helps' },
    ],
    manifesto: {
      lead: "Health isn't sold on a promise.",
      rest: "It's sold with solid education, expert authority, and communication people trust in the decisions that matter most.",
    },
    marquee: [
      'Wellbeing',
      'Supplements',
      'Health education',
      'Expert',
      'Prevention',
      'Trust',
      'Support',
    ],
    collage: [
      {
        src: '/branze/health/health-1.jpg',
        alt: 'Supplement capsules with natural ingredients',
      },
    ],
  },

  // 5 — editorial
  {
    id: 'finanse',
    slug: 'finance',
    pairSlug: 'finanse',
    label: 'Finance',
    meta: {
      title: 'Social media for the finance industry',
      description:
        'We run social media for finance and fintech brands. Jargon-free education, authority, and communication people trust with their money.',
    },
    tagline:
      'Finance is trust in its purest form. We build it with clear, everyday communication for finance and fintech brands.',
    brief: {
      pillars: [
        'Building credibility',
        'Expert communication',
        'Thought leadership',
      ],
      paragraphs: [
        {
          text: 'Finance rests above all on trust. Audiences expect transparent communication, expert knowledge, and plain explanations of even the most complex topics. On social, the priority becomes building credibility and long-term relationships with clients.',
          strong:
            'On social, the priority becomes building credibility and long-term relationships with clients.',
        },
        {
          text: 'Per the Edelman Trust Barometer 2025, 64% of respondents say trust in a brand strongly influences their buying decisions. For finance, that means communication should not only inform about the offer but also consistently build an expert position and strengthen the brand’s reputation.',
        },
      ],
    },
    chips: [
      { value: 'B2B & B2C', label: 'communication tuned to the audience' },
      { value: 'Education', label: 'finance without the jargon' },
      { value: 'Trust', label: 'the foundation of every decision' },
    ],
    manifesto: {
      lead: "Money isn't handed to chance.",
      rest: "It's handed to a brand that explains hard topics in plain language and earns trust every day.",
    },
    marquee: [
      'Fintech',
      'Payments',
      'Financial education',
      'B2B',
      'Security',
      'Investing',
      'Trust',
    ],
    collage: [
      {
        src: '/branze/finanse/finanse-1.jpg',
        alt: 'Mobile payment on a smartphone',
      },
    ],
  },

  // 6 — editorial
  {
    id: 'petcare',
    slug: 'pet',
    pairSlug: 'petcare',
    label: 'Pet Industry',
    // Numbers verbatim from the Aquael case study.
    numbers: [
      { value: '388 717', label: 'Views (monthly avg.)' },
      { value: '184 799', label: 'Reach (monthly avg.)' },
      { value: '9 033', label: 'Engagement (monthly avg.)' },
      { value: '+660', label: 'Fan growth (monthly avg.)' },
    ],
    caseStudy: {
      slug: 'aquael',
      cardKicker: 'CASE STUDY',
      cardTitle: 'Expert communication for an aquascaping brand',
      creatives: [
        {
          src: '/case-studies/aquael/aquael-gallery-1.jpg',
          alt: 'Aquael campaign creative',
          width: 464,
          height: 701,
        },
        {
          src: '/case-studies/aquael/aquael-gallery-6.jpg',
          alt: 'Aquael Facebook profile — 45k followers and the Glossy Marine campaign cover art',
          width: 739,
          height: 1400,
        },
        {
          src: '/case-studies/aquael/aquael-gallery-3.jpg',
          alt: 'Aquael campaign creative',
          width: 463,
          height: 720,
        },
        {
          src: '/case-studies/aquael/aquael-gallery-4.jpg',
          alt: 'Aquael campaign creative',
          width: 465,
          height: 680,
        },
        {
          src: '/case-studies/aquael/aquael-gallery-5.jpg',
          alt: 'Aquael campaign creative',
          width: 1080,
          height: 1080,
        },
      ],
      quote: {
        text: "Social Lama is an agency that fully meets our expectations. The team's work proved satisfying enough that we decided to expand the collaboration to further projects.",
        attribution: 'Beata Nartowska, Aquael',
      },
    },
    relatedCaseStudies: [],
    meta: {
      title: 'Social media for the pet industry',
      description:
        'We run social media for pet and petcare brands. Loyal owner communities, how-to content, and real sales.',
    },
    tagline:
      'The pet industry runs on emotion and loyalty. We build owner communities where a pet is family — and treat the brands the same way.',
    brief: {
      pillars: [
        'Education & expertise',
        'Engaged communities',
        'Passion-driven content',
      ],
      paragraphs: [
        {
          text: 'The pet industry is a category driven by emotion, trust, and expert knowledge. Owners increasingly treat their pets as full members of the family, so they expect brands to deliver not just high-quality products but also valuable content and reliable advice.',
          strong:
            'Owners increasingly treat their pets as full members of the family, so they expect brands to deliver not just high-quality products but also valuable content and reliable advice.',
        },
        {
          text: 'Per the PMR “Pet market in Poland 2025” report, pet owners are increasingly investing in specialist products and actively seeking information on their pets’ health, nutrition, and care. So effective social communication should blend education, inspiration, and building an engaged community around a shared passion.',
        },
      ],
    },
    chips: [
      { value: 'Community', label: 'the most loyal audiences on social' },
      { value: 'How-tos', label: 'content they come back for' },
      { value: 'Emotion', label: 'a pet is family' },
    ],
    manifesto: {
      lead: 'To an owner, it\'s not "a pet." It\'s family.',
      rest: 'Brands that get this build the most loyal communities in all of social.',
    },
    marquee: [
      'Petcare',
      'Food',
      'Accessories',
      'Community',
      'How-tos',
      'Adoptions',
      'Animal love',
    ],
    collage: [
      {
        src: '/branze/petcare/petcare-1.jpg',
        alt: 'A dog and kitten meeting at home',
      },
    ],
  },

  // 7 — editorial
  {
    id: 'alkohole',
    slug: 'alcohol',
    pairSlug: 'alkohole',
    label: 'Alcohol',
    // Numbers verbatim from the Faktoria Win case study.
    numbers: [
      { value: '417 tys.', label: 'Reach (monthly avg.)' },
      { value: '827 tys.', label: 'Views (monthly avg.)' },
      { value: '17 tys.', label: 'Profile visits (monthly avg.)' },
      { value: '25 tys.', label: 'Link clicks (monthly avg.)' },
    ],
    caseStudy: {
      slug: 'faktoria-win',
      cardKicker: 'CASE STUDY',
      cardTitle: 'Communication for a wine brand',
      creatives: [
        {
          src: '/case-studies/faktoria-win/faktoria-win-gallery-6.jpg',
          alt: 'Faktoria Win contest creative with Kumala wines and two iPhone 14s as the prize',
          width: 1200,
          height: 1200,
        },
        {
          src: '/case-studies/faktoria-win/faktoria-win-gallery-3.jpg',
          alt: 'Collage of Faktoria Win creatives from the Zgrana Para, recipe and lifestyle series',
          width: 1400,
          height: 1400,
        },
        {
          src: '/case-studies/mazurska-manufaktura-alkoholi/mazurska-manufaktura-alkoholi-gallery-2.jpg',
          alt: 'Mazurska Manufaktura Alkoholi creative: a Bielik Vodka bottling line with the line "We have already raised PLN 2,000,000"',
          width: 900,
          height: 900,
        },
        {
          src: '/case-studies/mazurska-manufaktura-alkoholi/mazurska-manufaktura-alkoholi-gallery-1.jpg',
          alt: 'Mazurska Manufaktura Alkoholi creative reading "Become our shareholder, you have until 11:59 p.m." beside the brand mark',
          width: 960,
          height: 960,
        },
        {
          src: '/case-studies/mazurska-manufaktura-alkoholi/mazurska-manufaktura-alkoholi-gallery-3.jpg',
          alt: 'Mazurska Manufaktura Alkoholi creative reading "Magda Gessler has already invested. And you?" with a portrait of the brand ambassador',
          width: 1200,
          height: 900,
        },
      ],
    },
    relatedCaseStudies: [
      {
        slug: 'mazurska-manufaktura-alkoholi',
        title: 'Crowdfunding with a brand ambassador',
      },
    ],
    meta: {
      title: 'Social media for the alcohol industry',
      description:
        'We run social media for alcohol brands — wine, craft beer, spirits. An aspirational image that respects regulations and responsible drinking.',
    },
    tagline:
      'Alcohol is a business of ritual and occasion. We build brands an aspirational image — with a feel for regulations and responsible drinking.',
    brief: {
      pillars: [
        'Brand storytelling',
        'Consumption occasions',
        'Engaged community',
      ],
      paragraphs: [
        {
          text: 'Alcohol is one of the most demanding categories on social. Legal restrictions mean brands can’t build communication on product or sales alone. The key roles go to emotion, storytelling, and building a strong world of values around the brand.',
          strong:
            'The key roles go to emotion, storytelling, and building a strong world of values around the brand.',
        },
        {
          text: 'We know consumers choose specific brands not only for taste but also for the story, tradition, values, and special occasions that come with them. So we build communication grounded in engaging stories, positive associations, and natural moments of contact with the brand — strengthening its recognition and building long-term relationships with the audience.',
        },
      ],
    },
    chips: [
      { value: 'Regulations', label: 'communication that stays compliant' },
      { value: 'Ritual', label: 'a brand woven into the moment' },
      { value: 'Aspiration', label: 'a premium image' },
    ],
    manifesto: {
      lead: 'Alcohol plays by its own rules.',
      rest: 'Regulations, timing, and ritual — you have to feel all three to build an aspirational brand.',
    },
    marquee: [
      'Wine',
      'Craft beer',
      'Spirits',
      'Ritual',
      'Occasions',
      'Tastings',
      'Responsible drinking',
    ],
    collage: [
      {
        src: '/branze/alkohole/alkohole-1.jpg',
        alt: 'Liquor bottles on bar shelves',
      },
    ],
  },

  // 8 — editorial
  {
    id: 'fashion',
    slug: 'fashion',
    pairSlug: 'fashion',
    label: 'Fashion',
    meta: {
      title: 'Social media for the fashion industry',
      description:
        'We run social media for fashion brands. We build desire around drops and collections, pair lookbooks with UGC, and turn followers into customers.',
    },
    tagline:
      'Fashion is a business of pace. We give brands the rhythm of the feed — building desire around drops and collections, season after season.',
    brief: {
      pillars: [
        'Trend-driven content',
        'Influencer marketing',
        'Social commerce',
      ],
      paragraphs: [
        {
          text: 'Fashion is one of the most dynamic categories on social. Consumers expect brands to deliver not just product shots but also inspiration, authenticity, and a coherent world of values.',
        },
        {
          text: 'Per Euromonitor’s “Top Global Consumer Trends 2025,” consumers increasingly choose brands that reflect their lifestyle and let them express their own identity. That makes social a space for fashion brands to build desire, inspire audiences, and create engaged communities.',
          strong:
            'a space for fashion brands to build desire, inspire audiences, and create engaged communities.',
        },
      ],
    },
    chips: [
      { value: 'Trends', label: 'a brand always on time' },
      { value: 'Drop', label: 'the tension that sells' },
      { value: 'UGC', label: 'style, styled by the community' },
    ],
    manifesto: {
      lead: 'Fashion moves faster than the feed.',
      rest: 'The winners set the pace — building desire around drops and turning followers into customers.',
    },
    marquee: [
      'Fashion',
      'Trends',
      'Lookbook',
      'Drop',
      'UGC',
      'Collections',
      'Style',
    ],
    collage: [
      {
        src: '/branze/fashion/fashion-1.jpg',
        alt: 'A model in a white outfit on the runway',
      },
    ],
  },

  // 9 — editorial
  {
    id: 'horeca',
    slug: 'horeca',
    pairSlug: 'horeca',
    label: 'Horeca',
    // Numbers verbatim from the Julius Meinl case study.
    numbers: [
      { value: '4 806', label: 'Interactions', delta: '+956,3%' },
      { value: '432 616', label: 'Views', delta: '+1 380%' },
      { value: '147 040', label: 'Viewers' },
      { value: '4 430', label: 'Clicks', delta: '+24 511%' },
    ],
    caseStudy: {
      slug: 'julius-meinl',
      cardKicker: 'CASE STUDY',
      cardTitle: 'Premium coffee and industry events',
      creatives: [
        {
          src: '/case-studies/julius-meinl/julius-meinl-szkolenia-1.png',
          alt: 'Red Julius Meinl cup and saucer on a sunny terrace',
          width: 440,
          height: 440,
        },
        {
          src: '/case-studies/julius-meinl/julius-meinl-lifestyle-2.png',
          alt: 'Two Julius Meinl cups on a cafe table, the "she talks, she listens" creative',
          width: 1266,
          height: 1566,
        },
        {
          src: '/case-studies/julius-meinl/julius-meinl-gallery-3-cut.webp?v=2',
          alt: 'Instagram creative "3 mistakes in latte art" with a red Julius Meinl coffee cup',
          width: 320,
          height: 523,
        },
        {
          src: '/case-studies/julius-meinl/julius-meinl-gallery-4.jpg',
          alt: 'Instagram creative "Fact or myth" with a cup of Julius Meinl coffee',
          width: 419,
          height: 581,
        },
        {
          src: '/case-studies/julius-meinl/julius-meinl-eventy-1.png',
          alt: 'Announcement graphic for the Polish final of the Julius Meinl Barista Cup 2026, with beach volleyball and an espresso cup',
          width: 1574,
          height: 1572,
        },
      ],
    },
    relatedCaseStudies: [
      {
        slug: 'belvedere',
        title: 'A premium restaurant in Łazienki Park',
      },
    ],
    meta: {
      title: 'Social media for the HoReCa industry',
      description:
        'We run social media for restaurants, cafés, and bars. Mouth-watering food content, building a sense of place, and communication that fills tables.',
    },
    tagline:
      'HoReCa is an appetite business. We spark it where hunger starts — in the feed. Food content and communication that fills tables.',
    brief: {
      pillars: [
        'Appetizing content',
        'Seasonality & trends',
        'Engaged community',
      ],
      paragraphs: [
        {
          text: 'HoReCa is a category where consumers buy not just a product but, above all, an experience. On social, what counts is emotion, aesthetics, and the craft of telling stories that make people want to visit the venue or reach for the product.',
          strong:
            'what counts is emotion, aesthetics, and the craft of telling stories that make people want to visit the venue or reach for the product.',
        },
        {
          text: 'Per the PMR “HoReCa market in Poland 2025” report, 58% of Gen Z check online reviews before a first visit to a restaurant. That shows how big a role social media, recommendations, and authentic customer experiences play today. So we build communication that blends compelling visual content, seasonal trends, and engaging formats — helping brands build recognition and a loyal community.',
        },
      ],
    },
    chips: [
      { value: 'Food content', label: 'photos you can practically taste' },
      { value: 'Atmosphere', label: 'a place worth coming back to' },
      { value: 'Reservations', label: 'a feed that fills tables' },
    ],
    manifesto: {
      lead: 'Hunger starts in the feed.',
      rest: 'Before a guest crosses the threshold, appetizing content and a sense of place are already filling tables.',
    },
    marquee: [
      'Restaurants',
      'Cafés',
      'Menu',
      'Food content',
      'Reservations',
      'Atmosphere',
      'Occasions',
    ],
    collage: [
      {
        src: '/branze/horeca/horeca-1.jpg',
        alt: 'A dessert plated on a marble restaurant table',
      },
    ],
  },

  // 10 — editorial
  {
    id: 'hotele-i-miejsca-wypoczynkowe',
    slug: 'hospitality',
    pairSlug: 'hotele-i-miejsca-wypoczynkowe',
    label: 'Hotels & Resorts',
    // Numbers verbatim from the Dolina Charlotty case study.
    numbers: [
      { value: '15,5 mln', label: 'Views', delta: '+44,7%' },
      { value: '285 593', label: 'Reach', delta: '+87,7%' },
      { value: '51 278', label: 'Content interactions', delta: '+168,8%' },
      { value: '99 509', label: 'Link clicks', delta: '+67,4%' },
    ],
    caseStudy: {
      slug: 'dolina-charlotty',
      cardKicker: 'CASE STUDY',
      cardTitle: 'A resort & SPA as a year-round destination',
      creatives: [
        {
          src: '/case-studies/dolina-charlotty/dolina-charlotty-gallery-6.jpg',
          alt: 'Photo from an in-house shoot at Dolina Charlotty, a brick hotel building with balconies decorated with red flowers in summer',
          width: 555,
          height: 832,
        },
        {
          src: '/case-studies/dolina-charlotty/dolina-charlotty-gallery-3-cut.webp?v=2',
          alt: 'Dolina Charlotty Instagram story with a llama from Zoo Charlotta and a poll answered 71% yes',
          width: 412,
          height: 735,
        },
        {
          src: '/case-studies/dolina-charlotty/dolina-charlotty-gallery-4-cut.webp?v=2',
          alt: 'Dolina Charlotty ad creative with two lemurs, headlined "Zoo tickets at half price"',
          width: 412,
          height: 501,
        },
        {
          src: '/case-studies/dolina-charlotty/dolina-charlotty-gallery-5-cut.webp?v=2',
          alt: 'Frame from a Dolina Charlotty reel, a shot over the water with the line "Visit Dolina Charlotty"',
          width: 398,
          height: 485,
        },
      ],
    },
    relatedCaseStudies: [
      {
        slug: 'skibooking',
        title: 'Online ski booking',
      },
      {
        slug: 'getaway',
        title: 'A travel creator on social media',
      },
    ],
    meta: {
      // Mirrors the Polish pair's new shape. Not a keyword play: EN gets parity
      // content, not search targeting.
      title: 'Hotel and resort marketing',
      description:
        'We run social media for hotels, resorts, and spas. Aspirational travel content and communication that turns a scroll into a booking.',
    },
    tagline:
      'Hotel marketing starts long before the booking — in the scroll. We run social media for hotels, resorts, and spas: aspirational travel content that sells the stay before a guest packs a bag.',
    brief: {
      pillars: [
        'Experience storytelling',
        'Inspiring visual content',
        'Building guest loyalty',
      ],
      paragraphs: [
        {
          text: 'In hospitality and travel, guests don’t buy a night’s stay — they buy emotion, memories, and exceptional experiences. That’s exactly why social plays such a big role in inspiring trips and shaping a place’s image.',
        },
        {
          text: 'Per the Polish Tourism Organisation’s “Tourism in times of change 2025” study, 77% of Poles look for inspiration and information online before a trip. That means compelling visual content, authentic stories, and a consistently built brand image have a real impact on where people choose to vacation.',
          strong:
            '77% of Poles look for inspiration and information online before a trip.',
        },
      ],
    },
    chips: [
      { value: 'Aspiration', label: 'a place worth dreaming about' },
      { value: 'Booking', label: 'content that drives reservations' },
      { value: 'Seasons', label: 'communication all year round' },
    ],
    manifesto: {
      lead: 'A vacation is bought on a dream.',
      rest: 'Aspirational travel content sells the place before a guest even packs a bag.',
    },
    marquee: [
      'Hotels',
      'Resorts',
      'Spa',
      'Leisure',
      'Travel content',
      'Reservations',
      'Experience',
    ],
    collage: [
      {
        src: '/branze/hotele-i-miejsca-wypoczynkowe/hotele-i-miejsca-wypoczynkowe-1.jpg',
        alt: 'An elegant hotel pool with a rotunda',
      },
    ],
  },

  // 11 — editorial
  {
    id: 'nieruchomosci-i-deweloperzy',
    slug: 'real-estate',
    pairSlug: 'nieruchomosci-i-deweloperzy',
    label: 'Real Estate & Developers',
    // Numbers verbatim from the ED Invest case study.
    numbers: [
      { value: '2,6 mln', label: 'Views', delta: '+180%' },
      { value: '1,9 tys.', label: 'Content interactions', delta: '+181,5%' },
      { value: '270', label: 'New followers', delta: '+260%' },
      { value: '7 tys.', label: 'Profile visits', delta: '+3,4%' },
    ],
    caseStudy: {
      slug: 'ed-invest',
      cardKicker: 'CASE STUDY',
      cardTitle: 'A developer on Facebook, Instagram and LinkedIn',
      creatives: [
        {
          src: '/case-studies/ed-invest/ed-invest-gallery-1-cut.webp?v=2',
          alt: 'Frame from an ED Invest video, an aerial view of a residential development under construction against the city skyline',
          width: 694,
          height: 1400,
        },
        {
          src: '/case-studies/ed-invest/ed-invest-gallery-3-cut.webp?v=2',
          alt: 'Video coverage of the Orange Ball industry event, a stage carrying the ED Invest logo',
          width: 694,
          height: 1400,
        },
        {
          src: '/case-studies/ed-invest/ed-invest-gallery-4-cut.webp?v=2',
          alt: 'A group photo of ED Invest representatives with their award at an industry gala',
          width: 694,
          height: 1400,
        },
        {
          src: '/case-studies/ed-invest/ed-invest-gallery-5.jpg',
          alt: 'Graphic creative for the ED Invest Goclaw development, a rendering of a small-scale building with a tagline about the highest standards',
          width: 1080,
          height: 1350,
        },
      ],
    },
    relatedCaseStudies: [
      {
        slug: 'jw-construction',
        title: 'Prefabricated construction and investments',
      },
      {
        slug: 'dynamic-development',
        title: 'Developer communication on social media',
      },
    ],
    meta: {
      title: 'Real-estate and developer marketing',
      description:
        'We run social media for developers and real-estate brands. Presenting investments, building trust, and communication that generates leads.',
    },
    tagline:
      'Real-estate marketing works the longest buying path there is. We run social media for developers and agencies: presenting investments, building the trust that comes before the decision, and generating leads.',
    brief: {
      pillars: [
        'Investment storytelling',
        'Expert personal branding',
        'Building trust',
      ],
      paragraphs: [
        {
          text: 'Buying property is one of the biggest financial decisions in a consumer’s life. In real estate, social plays a far bigger role than just a sales channel — it helps build brand credibility, educate clients, and present the lifestyle tied to an investment.',
        },
        {
          text: 'Per Otodom’s “Happy Home. Poles’ housing expectations 2025” report, 80% of Poles say they use the internet when searching for property. That means a brand’s digital presence is often the first point of contact with a prospective client, and transparent, expert communication can genuinely shape buying decisions.',
          strong:
            'a brand’s digital presence is often the first point of contact with a prospective client, and transparent, expert communication can genuinely shape buying decisions.',
        },
      ],
    },
    chips: [
      { value: 'Leads', label: 'communication built for contact' },
      { value: 'Renderings', label: 'an investment you can see' },
      { value: 'Trust', label: 'the foundation of a life decision' },
    ],
    manifesto: {
      lead: 'Buying property is a life decision.',
      rest: "It's preceded by trust — we build it by presenting investments and communication that generates real leads.",
    },
    marquee: [
      'Developers',
      'Investments',
      'Apartments',
      'Renderings',
      'Location',
      'Leads',
      'Trust',
    ],
    collage: [
      {
        src: '/branze/nieruchomosci-i-deweloperzy/nieruchomosci-i-deweloperzy-1.jpg',
        alt: 'A modern living room with an open kitchen',
      },
    ],
  },

  // 12 — editorial
  {
    id: 'rozrywka',
    slug: 'entertainment',
    pairSlug: 'rozrywka',
    label: 'Entertainment',
    // Numbers verbatim from the Skrzat. Nowy początek case study.
    numbers: [
      { value: '35 mln', label: 'Views (TikTok)' },
      { value: '100 tys.', label: 'Likes (TikTok)' },
      { value: '4,38 mln', label: 'Views (Instagram)' },
      { value: '1,14 mln', label: 'Reach (Instagram)' },
    ],
    caseStudy: {
      slug: 'skrzat',
      cardKicker: 'CASE STUDY',
      cardTitle: 'A film premiere and 35M views',
      creatives: [
        {
          src: '/case-studies/skrzat/skrzat-gallery-1.jpg',
          alt: 'Promotional graphic "How many gnomes are hiding in the forest?" with gnome silhouettes in a sunlit forest',
          width: 540,
          height: 675,
        },
      ],
    },
    relatedCaseStudies: [
      {
        slug: 'rabkoland',
        title: 'An amusement park for the whole family',
      },
    ],
    meta: {
      title: 'Social media for the entertainment industry',
      description:
        'We run social media for entertainment brands — events, culture, premieres. We build hype, activate the community, and create content that lives in the comments.',
    },
    tagline:
      'Entertainment is a business of fighting for attention. We win it with content — building hype around premieres and events, and activating the community.',
    brief: {
      pillars: [
        'Community marketing',
        'Seasonal campaigns',
        'Real-time marketing',
      ],
      paragraphs: [
        {
          text: 'Entertainment is built on emotion, experiences, and time spent together. On social, what matters most is creating engaging content that doesn’t just inform about the offer but, above all, invites audiences to take part and share their own experiences.',
        },
        {
          text: 'Per Deloitte’s “Digital Consumer Trends 2025,” consumers increasingly seek entertainment that lets them build relationships and create shared memories. So brands in this category should show up where their audience’s conversations happen, react to live trends, and consistently build a community around what they do.',
          strong:
            'brands in this category should show up where their audience’s conversations happen, react to live trends, and consistently build a community around what they do.',
        },
      ],
    },
    chips: [
      { value: 'Hype', label: 'the buzz before a premiere' },
      { value: 'Community', label: 'an audience that co-creates' },
      { value: 'Engagement', label: 'content people share' },
    ],
    manifesto: {
      lead: 'Attention is the currency of entertainment.',
      rest: 'We build hype around premieres, activate the community, and create content that lives in the comments.',
    },
    marquee: [
      'Events',
      'Culture',
      'Premieres',
      'Community',
      'Engagement',
      'Emotion',
      'Live',
    ],
    collage: [
      {
        src: '/branze/rozrywka/rozrywka-1.jpg',
        alt: 'A concert stage in blue lights',
      },
    ],
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
