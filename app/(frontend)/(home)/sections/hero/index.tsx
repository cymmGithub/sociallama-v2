'use client'

import cn from 'clsx'
import { SocialLinks } from '@/components/ui/social-links'
import type { LocalizedHome } from '@/lib/content/home'
import { useRotator } from '@/lib/hooks/use-rotator'
import s from './hero.module.css'
import { HeroLooks } from './outfit-stack'

export function Hero({ content }: { content: LocalizedHome['hero'] }) {
  // Timer-based word rotator (hero-outfit-swap), same mechanism as JoinCta:
  // paused off-screen, static first word under reduced motion. The rotator
  // index also drives the llama's outfit (static front pose, wardrobe swap)
  // — sync is structural, so word and outfit cannot drift apart. (Timed
  // coupling against the old turn montage was tried and rejected 2026-07-22;
  // the boss-approved static-pose concept 2026-07-24 makes sync trivial.)
  // The hook's ref also serves as the headline element ref.
  const { ref: headlineRef, rotation } = useRotator<HTMLDivElement>(
    content.headline.rotator.length
  )

  // No entrance animation and no client media gate: the outfit stack is plain
  // images (no canvas/decode loop to defer), so it renders identically on the
  // server and in every mode. SSR paints look-01; reduced motion holds it
  // (the rotator stays on index 0); on-screen it swaps with the word.

  return (
    <section className={s.hero}>
      {/* Desktop llama: transparent front-pose stills (rembg matte) composited
          onto the brand-plum (#913155) chapter — no baked plum, so Safari has
          no video colour pipeline to mis-manage. Absolute, right-anchored;
          .video hides it on mobile. This instance owns the look-01 preload. */}
      <HeroLooks
        index={rotation.index}
        alt={content.llamaAlt}
        positionClass={s.video}
        primary
      />
      <div className={s.inner}>
        <div className={s.copy}>
          {/* Heading extractors (SEO crawlers included) read DOM
              textContent, not aria-label — so the canonical phrase is a
              real sr-only <h1> and the rotating visual is an aria-hidden
              sibling that never pollutes the heading outline. */}
          <h1 className="sr-only">{content.headline.srHeading}</h1>
          <div ref={headlineRef} className={s.headline} aria-hidden="true">
            <span aria-hidden="true" className={s.lineMask}>
              <span className={cn(s.line, s.lineSmall, s.rotator)}>
                {content.headline.rotator.map((word, index) => (
                  <span
                    key={word}
                    className={cn(
                      s.rotatorWord,
                      index === rotation.index && s.rotatorWordActive,
                      index === rotation.prev && s.rotatorWordLeaving
                    )}
                  >
                    {word}
                  </span>
                ))}
              </span>
            </span>
            {content.headline.lines.map((line, index) => (
              <span aria-hidden="true" key={line} className={s.lineMask}>
                <span
                  className={cn(s.line, index === 0 ? s.lineBig : s.lineLight)}
                >
                  {line}
                </span>
              </span>
            ))}
          </div>

          <SocialLinks
            className={s.socials}
            linkClassName={s.social}
            iconClassName={s.socialIcon}
          />
        </div>

        {/* Mobile llama: the same index-driven outfit swap, full-bleed below
            the copy (.media hides this box on desktop). Framed to the llama via
            .mobileBox since the stills sit bottom-right in their canvas. */}
        <div className={s.media}>
          <HeroLooks
            index={rotation.index}
            alt={content.llamaAlt}
            positionClass={s.mobileBox}
          />
        </div>
      </div>
    </section>
  )
}
