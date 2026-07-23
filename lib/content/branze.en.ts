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
    ctaHeadline: 'WANT RESULTS LIKE THESE IN YOUR INDUSTRY?',
  },
  editorial: {
    manifestoKicker: 'OUR APPROACH',
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
          width: 351,
          height: 760,
        },
        {
          src: '/case-studies/volvo/volvo-vcw-goracy.jpg',
          alt: 'Volvo "Hot season?" creative about prepping the car for summer',
          width: 351,
          height: 760,
        },
        {
          src: '/case-studies/volvo/volvo-event-ex30.jpg',
          alt: 'The electric Volvo EX30 shown at an outdoor event',
          width: 406,
          height: 720,
        },
        {
          src: '/case-studies/volvo/volvo-event-noc.jpg',
          alt: 'Museum Night coverage at the Volvo showroom — a concert in moody lighting',
          width: 406,
          height: 720,
        },
        {
          src: '/case-studies/volvo/volvo-dom-savedate.jpg',
          alt: '"Save the date" creative — open days at Dom Volvo',
          width: 585,
          height: 1266,
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
        // Phone mockups only — galleries 4 and 5 are laptop/YouTube frames whose
        // landscape shape doesn't belong on a feed wall. Alts match the case study.
        {
          src: '/case-studies/irobot/irobot-gallery-1.jpg',
          alt: 'iRobot TikTok post — “Want to come home to a clean house?”',
          width: 437,
          height: 900,
        },
        {
          src: '/case-studies/irobot/irobot-gallery-2.jpg',
          alt: 'iRobot TikTok post showing a Roomba at work on the floor',
          width: 350,
          height: 720,
        },
        {
          src: '/case-studies/irobot/irobot-gallery-3.jpg',
          alt: 'Humorous creator video with a Roomba from the iRobot TikTok campaign',
          width: 524,
          height: 1080,
        },
        {
          src: '/case-studies/irobot/irobot-gallery-6.jpg',
          alt: 'Creator video with a Roomba from the iRobot TikTok campaign',
          width: 437,
          height: 900,
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
      {
        src: '/branze/beauty/beauty-2.jpg',
        alt: 'Serum and face cream on a neutral backdrop',
      },
      {
        src: '/branze/beauty/beauty-3.jpg',
        alt: 'Face serum in glass dropper bottles',
      },
    ],
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
      {
        src: '/branze/health/health-2.jpg',
        alt: 'Lemon, ginger, and supplements on marble',
      },
      {
        src: '/branze/health/health-3.jpg',
        alt: 'Supplements in ceramic bowls',
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
      title: 'Social media for the finance industry | Social Lama',
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
      {
        src: '/branze/finanse/finanse-2.jpg',
        alt: 'Contactless card payment at a terminal',
      },
      {
        src: '/branze/finanse/finanse-3.jpg',
        alt: 'A fan of payment cards in hand',
      },
    ],
  },

  // 6 — editorial
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
      { src: '/branze/petcare/petcare-2.jpg', alt: 'An owner hugging a puppy' },
      {
        src: '/branze/petcare/petcare-3.jpg',
        alt: 'A cat and dog cuddling in the grass',
      },
    ],
  },

  // 7 — editorial
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
      {
        src: '/branze/alkohole/alkohole-2.jpg',
        alt: 'A bartender pouring wine',
      },
      {
        src: '/branze/alkohole/alkohole-3.jpg',
        alt: 'A glass of red wine at a table setting',
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
      title: 'Social media for the fashion industry | Social Lama',
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
      {
        src: '/branze/fashion/fashion-2.jpg',
        alt: 'A model in a green top in an urban setting',
      },
      {
        src: '/branze/fashion/fashion-3.jpg',
        alt: 'A model in a maroon coat in a modern interior',
      },
    ],
  },

  // 9 — editorial
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
      {
        src: '/branze/horeca/horeca-2.jpg',
        alt: 'A main course with vegetables on an elegant plate',
      },
      {
        src: '/branze/horeca/horeca-3.jpg',
        alt: 'A chef composing a dish on the plate',
      },
    ],
  },

  // 10 — editorial
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
      {
        src: '/branze/hotele-i-miejsca-wypoczynkowe/hotele-i-miejsca-wypoczynkowe-2.jpg',
        alt: 'A tropical resort pool among palms',
      },
      {
        src: '/branze/hotele-i-miejsca-wypoczynkowe/hotele-i-miejsca-wypoczynkowe-3.jpg',
        alt: 'A resort with a pool at dusk',
      },
    ],
  },

  // 11 — editorial
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
      {
        src: '/branze/nieruchomosci-i-deweloperzy/nieruchomosci-i-deweloperzy-2.jpg',
        alt: 'A bright hallway in a new apartment',
      },
      {
        src: '/branze/nieruchomosci-i-deweloperzy/nieruchomosci-i-deweloperzy-3.jpg',
        alt: 'An apartment with a balcony view',
      },
    ],
  },

  // 12 — editorial
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
      { src: '/branze/rozrywka/rozrywka-2.jpg', alt: 'A crowd at a concert' },
      {
        src: '/branze/rozrywka/rozrywka-3.jpg',
        alt: 'An audience before a lit stage',
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
