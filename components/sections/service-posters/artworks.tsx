import type { CSSProperties, ReactNode } from 'react'
import type { PosterId, PosterVariant } from './ids'
import s from './posters.module.css'

/*
 * The seven service posters, direction A "Kreska" (mock of 2026-08-05, all
 * motifs user-approved). Each artwork returns the contents of an <svg> — the
 * frame, viewBox and plum ground belong to `ServicePoster`, which is also where
 * the motion attributes live.
 *
 * Two compositions per motif:
 *   card — 600×400, the mock's artwork transplanted geometry-for-geometry
 *   hero — 1440×540, recomposed (not cropped): the motif occupies the right
 *          two-thirds and the left third stays calm, because the service page's
 *          title and lead sit over it.
 *
 * Stroke widths do NOT scale between the two frames. Line weight is the brand
 * constant; the wider frame reads as more room around the same kreska, which is
 * how the mock's Strategia hero was drawn.
 */

interface ArtProps {
  variant: PosterVariant
  /** Document-unique prefix for `url(#…)` targets (defs are per instance). */
  uid: string
}

// —— Strategia — route with waypoints ————————————————————————————————————————

function Strategia({ variant }: ArtProps) {
  if (variant === 'hero') {
    return (
      <>
        <circle
          className={s.line}
          cx="1180"
          cy="150"
          r="205"
          strokeWidth="3"
          opacity="0.1"
        />
        <path
          className={`${s.line} ${s.routeDraw}`}
          pathLength="240"
          d="M -30 470 C 210 435, 265 335, 425 322 S 645 362, 782 272 S 955 135, 1122 122"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.6"
        />
        <circle className={s.solid} cx="68" cy="458" r="6" opacity="0.6" />
        <circle
          className={s.line}
          cx="425"
          cy="322"
          r="10"
          strokeWidth="4"
          opacity="0.7"
        />
        <circle
          className={s.line}
          cx="782"
          cy="272"
          r="10"
          strokeWidth="4"
          opacity="0.7"
        />
        <circle className={s.accent} cx="1122" cy="122" r="11" />
        <circle
          className={s.accentLine}
          cx="1122"
          cy="122"
          r="23"
          strokeWidth="3"
          opacity="0.85"
        />
        <circle
          className={`${s.accentLine} ${s.ping}`}
          cx="1122"
          cy="122"
          r="36"
          strokeWidth="2.5"
        />
        <path
          className={`${s.line} ${s.dashTravel}`}
          d="M 1148 112 Q 1240 88 1380 70"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="2 16"
          opacity="0.5"
        />
      </>
    )
  }

  return (
    <>
      <circle
        className={s.line}
        cx="470"
        cy="120"
        r="150"
        strokeWidth="3"
        opacity="0.12"
      />
      <path
        className={`${s.line} ${s.routeDraw}`}
        pathLength="240"
        d="M -20 360 C 90 345, 110 265, 185 252 S 300 285, 358 224 S 430 125, 505 108"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.9"
      />
      <circle className={s.solid} cx="42" cy="352" r="6" opacity="0.85" />
      <circle className={s.line} cx="185" cy="252" r="9" strokeWidth="4" />
      <circle className={s.line} cx="358" cy="224" r="9" strokeWidth="4" />
      <circle className={s.accent} cx="505" cy="108" r="11" />
      <circle
        className={s.accentLine}
        cx="505"
        cy="108"
        r="22"
        strokeWidth="3"
        opacity="0.85"
      />
      <circle
        className={`${s.accentLine} ${s.ping}`}
        cx="505"
        cy="108"
        r="34"
        strokeWidth="2.5"
      />
      <path
        className={`${s.line} ${s.dashTravel}`}
        d="M 527 100 Q 570 84 640 66"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="2 14"
        opacity="0.6"
      />
    </>
  )
}

// —— Content — cascade of posts ——————————————————————————————————————————————

function Content({ variant }: ArtProps) {
  if (variant === 'hero') {
    return (
      <>
        <g transform="rotate(-9 1000 270)" opacity="0.28">
          <rect
            className={s.line}
            x="880"
            y="105"
            width="250"
            height="310"
            rx="18"
            strokeWidth="4"
          />
        </g>
        <g transform="rotate(-3 1020 275)" opacity="0.55">
          <rect
            className={s.line}
            x="930"
            y="118"
            width="250"
            height="310"
            rx="18"
            strokeWidth="4"
          />
        </g>
        <g transform="rotate(4 1100 290)">
          <rect
            className={s.line}
            x="985"
            y="132"
            width="250"
            height="310"
            rx="18"
            strokeWidth="4"
          />
          <circle
            className={s.line}
            cx="1030"
            cy="180"
            r="17"
            strokeWidth="4"
            opacity="0.85"
          />
          <line
            className={s.line}
            x1="1062"
            y1="172"
            x2="1190"
            y2="172"
            strokeWidth="7"
            strokeLinecap="round"
            opacity="0.7"
          />
          <line
            className={s.line}
            x1="1062"
            y1="192"
            x2="1150"
            y2="192"
            strokeWidth="7"
            strokeLinecap="round"
            opacity="0.4"
          />
          <rect
            className={s.line}
            x="1010"
            y="222"
            width="200"
            height="125"
            rx="12"
            strokeWidth="4"
            opacity="0.55"
          />
          <line
            className={s.line}
            x1="1010"
            y1="382"
            x2="1092"
            y2="382"
            strokeWidth="7"
            strokeLinecap="round"
            opacity="0.55"
          />
        </g>
        {/* Sits at y 168–242 rather than hard against the top edge: hero bands
            are copy-height, so a short one (Content's, with no CTA) crops ~65
            units off the top and would slide the accent under the transparent
            header's pills. */}
        <circle className={s.accent} cx="1272" cy="205" r="14" />
        <circle
          className={s.accentLine}
          cx="1272"
          cy="205"
          r="25"
          strokeWidth="3"
          opacity="0.55"
        />
        <circle
          className={`${s.accentLine} ${s.ping}`}
          cx="1272"
          cy="205"
          r="37"
          strokeWidth="2.5"
        />
      </>
    )
  }

  return (
    <>
      <g transform="rotate(-9 300 210)" opacity="0.28">
        <rect
          className={s.line}
          x="205"
          y="80"
          width="195"
          height="240"
          rx="16"
          strokeWidth="4"
        />
      </g>
      <g transform="rotate(-3 310 215)" opacity="0.55">
        <rect
          className={s.line}
          x="235"
          y="95"
          width="195"
          height="240"
          rx="16"
          strokeWidth="4"
        />
      </g>
      <g transform="rotate(4 365 230)">
        <rect
          className={s.line}
          x="268"
          y="110"
          width="195"
          height="240"
          rx="16"
          strokeWidth="4"
        />
        <circle
          className={s.line}
          cx="303"
          cy="148"
          r="15"
          strokeWidth="4"
          opacity="0.85"
        />
        <line
          className={s.line}
          x1="330"
          y1="142"
          x2="428"
          y2="142"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.7"
        />
        <line
          className={s.line}
          x1="330"
          y1="158"
          x2="400"
          y2="158"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.4"
        />
        <rect
          className={s.line}
          x="288"
          y="182"
          width="155"
          height="98"
          rx="10"
          strokeWidth="4"
          opacity="0.55"
        />
        <line
          className={s.line}
          x1="288"
          y1="308"
          x2="352"
          y2="308"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.55"
        />
      </g>
      <circle className={s.accent} cx="468" cy="112" r="13" />
      <circle
        className={s.accentLine}
        cx="468"
        cy="112"
        r="23"
        strokeWidth="3"
        opacity="0.55"
      />
      <circle
        className={`${s.accentLine} ${s.ping}`}
        cx="468"
        cy="112"
        r="34"
        strokeWidth="2.5"
      />
    </>
  )
}

// —— Sprzedaż — ascending bars with a trend line ——————————————————————————————

/** `--d` staggers the bars' draw-on; the last one is the orange accent. */
const CARD_BARS = [
  { x: 103, y: 260, h: 70, o: 0.35, d: '0s' },
  { x: 188, y: 220, h: 110, o: 0.45, d: '0.07s' },
  { x: 273, y: 180, h: 150, o: 0.55, d: '0.14s' },
  { x: 358, y: 130, h: 200, o: 0.7, d: '0.21s' },
] as const

const HERO_BARS = [
  { x: 760, y: 340, h: 90, o: 0.35, d: '0s' },
  { x: 870, y: 288, h: 142, o: 0.45, d: '0.07s' },
  { x: 980, y: 236, h: 194, o: 0.55, d: '0.14s' },
  { x: 1090, y: 172, h: 258, o: 0.7, d: '0.21s' },
] as const

function Sprzedaz({ variant }: ArtProps) {
  const hero = variant === 'hero'
  const bars = hero ? HERO_BARS : CARD_BARS
  const width = hero ? 44 : 34
  const radius = hero ? 10 : 8

  return (
    <>
      <line
        className={s.line}
        x1={hero ? 700 : 70}
        y1={hero ? 430 : 330}
        x2={hero ? 1340 : 540}
        y2={hero ? 430 : 330}
        strokeWidth="3"
        opacity="0.35"
      />
      {bars.map((bar) => (
        <rect
          key={bar.x}
          className={`${s.solid} ${s.bar}`}
          style={{ '--d': bar.d } as CSSProperties}
          x={bar.x}
          y={bar.y}
          width={width}
          height={bar.h}
          rx={radius}
          opacity={bar.o}
        />
      ))}
      <rect
        className={`${s.accent} ${s.bar}`}
        style={{ '--d': '0.28s' } as CSSProperties}
        x={hero ? 1200 : 443}
        y={hero ? 108 : 80}
        width={width}
        height={hero ? 322 : 250}
        rx={radius}
      />
      <path
        className={`${s.line} ${s.dashTravel}`}
        d={
          hero
            ? 'M 782 322 L 892 270 L 1002 218 L 1112 154 L 1222 90'
            : 'M 120 245 L 205 205 L 290 165 L 375 115 L 460 65'
        }
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="2 12"
        opacity="0.7"
      />
      <path
        className={s.line}
        d={
          hero ? 'M 1200 92 L 1222 90 L 1211 110' : 'M 441 66 L 460 65 L 451 82'
        }
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </>
  )
}

// —— Kampanie reklamowe — search field and a click ripple ————————————————————

function Kampanie({ variant }: ArtProps) {
  if (variant === 'hero') {
    return (
      <>
        <rect
          className={s.line}
          x="700"
          y="105"
          width="380"
          height="66"
          rx="33"
          strokeWidth="4"
          opacity="0.45"
        />
        <circle
          className={s.line}
          cx="742"
          cy="133"
          r="12"
          strokeWidth="3.5"
          opacity="0.45"
        />
        <line
          className={s.line}
          x1="751"
          y1="142"
          x2="762"
          y2="153"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.45"
        />
        <line
          className={s.line}
          x1="786"
          y1="139"
          x2="930"
          y2="139"
          strokeWidth="7"
          strokeLinecap="round"
          opacity="0.22"
        />
        <circle
          className={s.line}
          cx="1120"
          cy="330"
          r="84"
          strokeWidth="3"
          opacity="0.15"
        />
        <circle
          className={`${s.accentLine} ${s.rip}`}
          cx="1120"
          cy="330"
          r="42"
          strokeWidth="3.5"
        />
        <circle
          className={`${s.accentLine} ${s.rip} ${s.rip2}`}
          cx="1120"
          cy="330"
          r="64"
          strokeWidth="2.5"
        />
        <path
          className={s.solid}
          d="M 1120 330 l 0 76 l 22 -18 l 16 31 l 14 -7 l -16 -30.5 l 28 -2 Z"
          stroke="var(--color-plum-dark)"
          strokeWidth="2"
        />
      </>
    )
  }

  return (
    <>
      <rect
        className={s.line}
        x="60"
        y="70"
        width="300"
        height="58"
        rx="29"
        strokeWidth="4"
        opacity="0.45"
      />
      <circle
        className={s.line}
        cx="95"
        cy="95"
        r="10"
        strokeWidth="3.5"
        opacity="0.45"
      />
      <line
        className={s.line}
        x1="103"
        y1="103"
        x2="112"
        y2="112"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.45"
      />
      <line
        className={s.line}
        x1="132"
        y1="99"
        x2="250"
        y2="99"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.22"
      />
      <circle
        className={s.line}
        cx="400"
        cy="250"
        r="68"
        strokeWidth="3"
        opacity="0.15"
      />
      <circle
        className={`${s.accentLine} ${s.rip}`}
        cx="400"
        cy="250"
        r="34"
        strokeWidth="3.5"
      />
      <circle
        className={`${s.accentLine} ${s.rip} ${s.rip2}`}
        cx="400"
        cy="250"
        r="52"
        strokeWidth="2.5"
      />
      <path
        className={s.solid}
        d="M 400 250 l 0 66 l 19 -16 l 14 27 l 12 -6 l -14 -26.5 l 24 -2 Z"
        stroke="var(--color-plum-dark)"
        strokeWidth="2"
      />
    </>
  )
}

// —— Kreacje & Wideo — play button on a filmstrip ————————————————————————————

function Kreacje({ variant }: ArtProps) {
  if (variant === 'hero') {
    return (
      <>
        <rect
          className={s.line}
          x="-20"
          y="170"
          width="1480"
          height="200"
          strokeWidth="3"
          opacity="0.18"
        />
        <line
          className={`${s.line} ${s.filmLine}`}
          x1="-20"
          y1="194"
          x2="1460"
          y2="194"
          strokeWidth="7"
          strokeDasharray="15 20"
          opacity="0.28"
        />
        <line
          className={`${s.line} ${s.filmLine}`}
          x1="-20"
          y1="346"
          x2="1460"
          y2="346"
          strokeWidth="7"
          strokeDasharray="15 20"
          opacity="0.28"
        />
        <circle className={s.line} cx="1100" cy="270" r="120" strokeWidth="5" />
        <path className={s.accent} d="M 1070 214 L 1166 270 L 1070 326 Z" />
        <path
          className={s.line}
          d="M 1330 80 h 46 v 46"
          strokeWidth="4"
          opacity="0.55"
        />
        <path
          className={s.line}
          d="M 706 470 h -46 v -46"
          strokeWidth="4"
          opacity="0.55"
        />
      </>
    )
  }

  return (
    <>
      <rect
        className={s.line}
        x="-20"
        y="145"
        width="640"
        height="124"
        strokeWidth="3"
        opacity="0.18"
      />
      <line
        className={`${s.line} ${s.filmLine}`}
        x1="-20"
        y1="162"
        x2="620"
        y2="162"
        strokeWidth="7"
        strokeDasharray="15 20"
        opacity="0.28"
      />
      <line
        className={`${s.line} ${s.filmLine}`}
        x1="-20"
        y1="252"
        x2="620"
        y2="252"
        strokeWidth="7"
        strokeDasharray="15 20"
        opacity="0.28"
      />
      <circle className={s.line} cx="300" cy="207" r="95" strokeWidth="5" />
      <path className={s.accent} d="M 276 163 L 352 207 L 276 251 Z" />
      <path
        className={s.line}
        d="M 505 55 h 40 v 40"
        strokeWidth="4"
        opacity="0.55"
      />
      <path
        className={s.line}
        d="M 95 345 h -40 v -40"
        strokeWidth="4"
        opacity="0.55"
      />
    </>
  )
}

// —— Audyt i konsultacje — magnifier over a data grid ————————————————————————

/** Lens interior: the grid resolved into readable points, one of them flagged. */
const LENS_DOTS = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
] as const

function Audyt({ variant, uid }: ArtProps) {
  const hero = variant === 'hero'
  const cx = hero ? 1090 : 390
  const cy = hero ? 265 : 185
  const r = hero ? 155 : 112
  // The lens contents sit a touch above the ring's centre, exactly as the mock
  // drew it — the glass reads as looking slightly down the grid.
  const dotCy = hero ? 270 : 190
  const step = hero ? 95 : 72
  const dotR = hero ? 10 : 8

  return (
    <>
      <defs>
        {/* The mock spelled every background dot out; one tile renders the same
            lattice (65×70 card, 90×75 hero) without 45–96 circle nodes. */}
        <pattern
          id={`${uid}-grid`}
          patternUnits="userSpaceOnUse"
          width={hero ? 90 : 65}
          height={hero ? 75 : 70}
          x={hero ? 30 : 12.5}
          y={hero ? 37.5 : 25}
        >
          <circle
            className={s.solid}
            cx={hero ? 45 : 32.5}
            cy={hero ? 37.5 : 35}
            r="4"
            opacity="0.3"
          />
        </pattern>
        <clipPath id={`${uid}-lens`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <rect
        width={hero ? 1440 : 600}
        height={hero ? 540 : 400}
        fill={`url(#${uid}-grid)`}
      />
      <g clipPath={`url(#${uid}-lens)`}>
        <rect
          className={s.deep}
          x={cx - r - 20}
          y={cy - r - 20}
          width={(r + 20) * 2}
          height={(r + 20) * 2}
          opacity="0.45"
        />
        <g className={s.lensDots}>
          {LENS_DOTS.map(([col, row]) => (
            <circle
              key={`${col}:${row}`}
              className={s.solid}
              cx={cx + col * step}
              cy={dotCy + row * step}
              r={dotR}
              opacity="0.9"
            />
          ))}
          <circle className={s.accent} cx={cx} cy={dotCy} r={hero ? 14 : 11} />
        </g>
      </g>
      <circle className={s.line} cx={cx} cy={cy} r={r} strokeWidth="5" />
      <line
        className={s.line}
        x1={hero ? 1200 : 470}
        y1={hero ? 375 : 264}
        x2={hero ? 1330 : 552}
        y2={hero ? 505 : 352}
        strokeWidth="11"
        strokeLinecap="round"
      />
    </>
  )
}

// —— Influencer marketing — creator radiating signal to a community ——————————

function Influencer({ variant }: ArtProps) {
  if (variant === 'hero') {
    return (
      <>
        {/* Creator sits at x 854–1026: far enough right that the longest lead
            (the Polish one) clears its outer ring, per D2's calm copy side. */}
        <circle
          className={s.line}
          cx="940"
          cy="280"
          r="86"
          strokeWidth="4"
          strokeDasharray="7 11"
          opacity="0.5"
        />
        <circle
          className={s.line}
          cx="940"
          cy="280"
          r="56"
          strokeWidth="4"
          opacity="0.85"
        />
        <circle className={s.solid} cx="940" cy="280" r="18" />
        <path
          className={`${s.line} ${s.signal}`}
          d="M 1010 232 Q 1130 158 1252 138"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="2 13"
          opacity="0.6"
        />
        <path
          className={`${s.line} ${s.signal}`}
          d="M 1028 280 Q 1160 300 1300 306"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="2 13"
          opacity="0.6"
        />
        <path
          className={`${s.line} ${s.signal}`}
          d="M 1008 330 Q 1090 455 1200 480"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="2 13"
          opacity="0.6"
        />
        <circle className={s.solid} cx="1272" cy="134" r="11" />
        <circle className={s.solid} cx="1314" cy="160" r="6" opacity="0.7" />
        <circle className={s.accent} cx="1322" cy="306" r="14" />
        <circle
          className={s.accentLine}
          cx="1322"
          cy="306"
          r="26"
          strokeWidth="2.5"
          opacity="0.5"
        />
        <circle className={s.solid} cx="1366" cy="332" r="6" opacity="0.7" />
        <circle className={s.solid} cx="1222" cy="486" r="10" />
        <circle className={s.solid} cx="1264" cy="508" r="5" opacity="0.7" />
      </>
    )
  }

  return (
    <>
      <circle
        className={s.line}
        cx="210"
        cy="190"
        r="64"
        strokeWidth="4"
        strokeDasharray="7 11"
        opacity="0.5"
      />
      <circle
        className={s.line}
        cx="210"
        cy="190"
        r="42"
        strokeWidth="4"
        opacity="0.85"
      />
      <circle className={s.solid} cx="210" cy="190" r="14" />
      <path
        className={`${s.line} ${s.signal}`}
        d="M 262 158 Q 360 100 455 92"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="2 13"
        opacity="0.6"
      />
      <path
        className={`${s.line} ${s.signal}`}
        d="M 276 190 Q 400 205 483 208"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="2 13"
        opacity="0.6"
      />
      <path
        className={`${s.line} ${s.signal}`}
        d="M 254 222 Q 330 300 416 322"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="2 13"
        opacity="0.6"
      />
      <circle className={s.solid} cx="470" cy="90" r="9" />
      <circle className={s.solid} cx="497" cy="110" r="5" opacity="0.7" />
      <circle className={s.accent} cx="500" cy="210" r="11" />
      <circle
        className={s.accentLine}
        cx="500"
        cy="210"
        r="20"
        strokeWidth="2.5"
        opacity="0.5"
      />
      <circle className={s.solid} cx="527" cy="230" r="5" opacity="0.7" />
      <circle className={s.solid} cx="432" cy="330" r="8" />
      <circle className={s.solid} cx="458" cy="346" r="4" opacity="0.7" />
    </>
  )
}

export const ARTWORKS: Record<PosterId, (props: ArtProps) => ReactNode> = {
  strategia: Strategia,
  content: Content,
  sprzedaz: Sprzedaz,
  'kampanie-reklamowe': Kampanie,
  'kreacje-wideo': Kreacje,
  'audyt-i-konsultacje': Audyt,
  'influencer-marketing': Influencer,
}
