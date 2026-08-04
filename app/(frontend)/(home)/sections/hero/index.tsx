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
  const { ref: headlineRef, rotation } = useRotator<HTMLHeadingElement>(
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
          {/* The visual headline rotates; expose a stable accessible name. */}
          <h1
            ref={headlineRef}
            className={s.headline}
            aria-label={`${content.headline.rotator[0]} ${content.headline.lines.join(' ')}`}
          >
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
          </h1>

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
