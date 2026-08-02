'use client'

import cn from 'clsx'
import {
  Bookmark,
  CircleSmall,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
} from 'lucide-react'
import {
  type CSSProperties,
  type PointerEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { Image } from '@/components/ui/image'
import { Link } from '@/components/ui/link'
import type { LocalizedHome } from '@/lib/content/home'
import { usePreferredReducedMotion, useRotator } from '@/lib/hooks'
import s from './join-cta.module.css'

/* The heart starts part-filled so the visitor has to mean it: four
   activations complete the fill, and only then does the count move. */
const LIKE_STEPS = 4
const LIKE_START = 45
const TAP_WINDOW = 320
const TYPE_SPEED = 18
const TOAST_MS = 4600
const BLOOM_MS = 900
const BURST_MS = 620
/* Six particles at 60°, radiating just past the icon's edge — the payoff for
   four deliberate activations, not a firework. */
const BURST_ANGLES = [0, 60, 120, 180, 240, 300]

export function JoinCta({ content }: { content: LocalizedHome['joinCta'] }) {
  // Rotates the locative token through the offer. Static under reduced
  // motion (shows the first entry only); paused while off screen. The cube
  // reads the same index, so word and cube can never drift apart.
  const { ref: rotatorRef, rotation } = useRotator<HTMLElement>(
    content.rotator.length
  )
  const reducedMotion = usePreferredReducedMotion()

  const [likeStep, setLikeStep] = useState(0)
  // Counts activations, not fill steps: the heart keeps beating once it is
  // full, which is what the mock did and what a real like button does. Driving
  // the beat off likeStep instead goes dead the moment the fill tops out.
  const [beats, setBeats] = useState(0)
  const [bloom, setBloom] = useState(false)
  const [burst, setBurst] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [toastCta, setToastCta] = useState(false)
  const [flights, setFlights] = useState(0)
  const [comments, setComments] = useState(0)
  const [typed, setTyped] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuItem, setMenuItem] = useState<number | null>(null)

  const liked = likeStep >= LIKE_STEPS
  const fill =
    LIKE_START +
    ((100 - LIKE_START) * Math.min(likeStep, LIKE_STEPS)) / LIKE_STEPS
  const thread = content.post.thread.slice(0, comments)
  const latest = thread.at(-1)
  const exhausted = comments >= content.post.thread.length

  const menuRef = useRef<HTMLDivElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  const lastTap = useRef(0)

  // Types out the newest answer. Under reduced motion it lands complete —
  // the line is content, not decoration, so it may not be withheld.
  //
  // The character count is derived from elapsed time rather than incremented
  // once per tick. One-char-per-tick makes TYPE_SPEED a floor, not a
  // duration: every tick is a state update, so the render cost is added to
  // each interval and the effect runs as slowly as the device is heavy —
  // measured at 34ms/char against a stated 18ms, and slower again at
  // deviceScaleFactor 2. Deriving from the clock lets a late tick advance
  // several characters, so the line always takes length × TYPE_SPEED.
  useEffect(() => {
    if (!latest) return
    if (reducedMotion) {
      setTyped(latest.answer.length)
      return
    }
    setTyped(0)
    const start = performance.now()
    const id = setInterval(() => {
      const chars = Math.floor((performance.now() - start) / TYPE_SPEED)
      setTyped(Math.min(chars, latest.answer.length))
      if (chars >= latest.answer.length) clearInterval(id)
    }, TYPE_SPEED)
    return () => clearInterval(id)
  }, [latest, reducedMotion])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), TOAST_MS)
    return () => clearTimeout(id)
  }, [toast])

  useEffect(() => {
    if (!bloom) return
    const id = setTimeout(() => setBloom(false), BLOOM_MS)
    return () => clearTimeout(id)
  }, [bloom])

  useEffect(() => {
    if (!burst) return
    const id = setTimeout(() => setBurst(false), BURST_MS)
    return () => clearTimeout(id)
  }, [burst])

  // Escape and outside-pointer dismissal. Both are bound to the document
  // because the dropdown is non-modal: the rest of the page stays reachable,
  // so the press that should close it usually lands outside the panel. The
  // close is spelled out rather than calling closeMenu, whose identity would
  // re-bind the listeners on every render (and the lint rule's suggested
  // useCallback is banned by AGENTS.md — setters and refs are stable).
  //
  // There is no focus-moving effect here on purpose. Selecting an option now
  // expands its answer in place instead of replacing the list, so nothing
  // unmounts under focus and there is nothing to restore.
  useEffect(() => {
    if (!menuOpen) return
    function close() {
      setMenuOpen(false)
      setMenuItem(null)
      menuTriggerRef.current?.focus()
    }
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') close()
    }
    function onPointerDown(event: globalThis.PointerEvent) {
      const target = event.target as Node
      if (menuRef.current?.contains(target)) return
      if (menuTriggerRef.current?.contains(target)) return
      close()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [menuOpen])

  // The burst fires on the activation that COMPLETES the fill, and only that
  // one — it is the payoff for four deliberate presses, so it must not repeat
  // on every press afterwards the way the beat does. The check reads likeStep
  // from this render rather than from inside the updater, which has to stay
  // pure (React may call it twice).
  function completeLike() {
    setBeats((n) => n + 1)
    if (likeStep < LIKE_STEPS) setBurst(true)
    setBloom(true)
    setLikeStep(LIKE_STEPS)
  }

  function onLike() {
    setBeats((n) => n + 1)
    if (likeStep === LIKE_STEPS - 1) setBurst(true)
    setLikeStep((step) => Math.min(step + 1, LIKE_STEPS))
  }

  function onComment() {
    if (exhausted) return
    setComments((n) => n + 1)
  }

  async function onShare() {
    const url = window.location.href
    setFlights((n) => n + 1)
    if (navigator.share) {
      // A cancelled share sheet rejects — that is a choice, not a failure.
      await navigator.share({ url }).catch(() => undefined)
      return
    }
    await navigator.clipboard.writeText(url)
    setToastCta(false)
    setToast(content.post.shareCopied)
  }

  function onSave() {
    setSaved((was) => {
      if (!was) {
        setToastCta(true)
        setToast(content.post.saveToast)
      }
      return !was
    })
  }

  // Mouse double-click is handled by onDoubleClick; touch never fires it
  // reliably, so pointerup keeps its own window. Neither is the only route
  // to a full heart — the like button is always there.
  function onWellPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse') return
    // The toast sits inside the well; tapping its contact link must not also
    // read as half of a double-tap.
    if ((event.target as HTMLElement).closest('[data-toast]')) return
    const now = performance.now()
    if (now - lastTap.current < TAP_WINDOW) {
      lastTap.current = 0
      completeLike()
      return
    }
    lastTap.current = now
  }

  return (
    <section ref={rotatorRef} className={s.section}>
      <div className={s.copy}>
        {/* The visual token rotates; expose a stable accessible name. */}
        <h2
          className={s.heading}
          aria-label={`${content.headingLead} ${content.rotator[0]?.token ?? ''}`}
        >
          <span aria-hidden="true">{content.headingLead}</span>
          <span aria-hidden="true" className={s.tokenMask}>
            <span className={s.rotator}>
              {content.rotator.map((entry, index) => (
                <span
                  key={entry.token}
                  className={cn(
                    s.rotatorWord,
                    index === rotation.index && s.rotatorWordActive,
                    index === rotation.prev && s.rotatorWordLeaving
                  )}
                >
                  {entry.token}
                </span>
              ))}
            </span>
          </span>
        </h2>
        {/* Placement C: the services live under the heading, in the column
            that was otherwise empty below the button. All seven lists stack
            in one grid cell — the inactive ones are transparent, never
            `display: none`, because a list that exists for 2600ms at a time
            is unreachable by assistive technology and by crawlers, and this
            is the only place on the homepage that says what we do per
            platform. Stacking also fixes the block's height to the tallest
            list, so nothing reflows as the word turns. */}
        <div className={s.services}>
          <p className={s.servicesLead}>{content.servicesLead}</p>
          <div className={s.serviceStack}>
            {content.rotator.map((entry, index) => (
              <ul
                key={entry.token}
                className={cn(
                  s.serviceList,
                  index === rotation.index && s.serviceListActive
                )}
                aria-label={entry.token.replace('?', '')}
              >
                {entry.services.map((item) => (
                  <li key={item} className={s.chip}>
                    {item}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        <Link className={s.button} href={content.button.href}>
          {content.button.label}
        </Link>
      </div>
      {/* Wrapped in fake sponsored-post chrome: the CTA literally becomes the
          ad we'd run for ourselves. The mascot is a transparent cutout — the
          plum well behind it is a stylesheet decision, so the artwork is
          never fixed to one ground. */}
      <div className={s.media}>
        <div className={s.card}>
          <div className={s.cardHeader}>
            <Link
              className={s.cardProfile}
              href={content.post.href}
              aria-label={`${content.post.handle} ${content.post.onInstagram}`}
            >
              <span className={s.avatar} aria-hidden="true" />
              <span className={s.cardIdentity}>
                <b>{content.post.handle}</b>
                <span>
                  {content.post.meta}
                  <CircleSmall
                    className={s.metaSep}
                    fill="currentColor"
                    aria-hidden="true"
                  />
                  {liked ? content.post.metaNoteLiked : content.post.metaNote}
                </span>
              </span>
            </Link>
            <button
              ref={menuTriggerRef}
              type="button"
              className={cn(s.action, s.cardMore)}
              aria-label={content.post.menu}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => {
                setMenuOpen((was) => !was)
                setMenuItem(null)
              }}
            >
              <MoreHorizontal aria-hidden="true" />
            </button>
            {/* Non-modal dropdown: no scrim, no aria-modal, no Tab trap — the
                page behind it stays reachable. It sits directly after its
                trigger in the DOM so Tab reaches the options next rather than
                walking the card's other controls first, and each option is a
                disclosure whose answer opens beneath it with the list still
                mounted. Nothing unmounts under focus, which is what removes the
                Safari/iOS failure rather than compensating for it. */}
            {menuOpen && (
              <div ref={menuRef} id={menuId} className={s.menu}>
                <ul className={s.menuList}>
                  {content.post.menuItems.map((item, index) => {
                    const open = menuItem === index
                    return (
                      <li key={item.label}>
                        <button
                          type="button"
                          className={s.menuItem}
                          aria-expanded={open}
                          onClick={() => setMenuItem(open ? null : index)}
                        >
                          {item.label}
                        </button>
                        {open && (
                          <div className={s.menuAnswer}>
                            <p>{item.answer}</p>
                            <Link
                              className={s.menuCta}
                              href={content.post.menuCta.href}
                            >
                              {content.post.menuCta.label}
                            </Link>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: the double-tap is a gesture shortcut to the like button's state, which stays the keyboard route */}
          <div
            className={s.well}
            onDoubleClick={completeLike}
            onPointerUp={onWellPointerUp}
          >
            {/* Stage = the llama's own bounding box, so the cube slot is a
                percentage of the mascot rather than of the card and stays on
                the raised paw at every width. */}
            <div className={s.stage}>
              <Image
                src={content.llama}
                alt={content.llamaAlt}
                width={693}
                height={979}
                unoptimized
                objectFit="contain"
                className={s.llama}
              />
              <span className={s.slot} aria-hidden="true">
                {content.rotator.map((entry, index) => (
                  <Image
                    key={entry.cube}
                    src={entry.cube}
                    alt=""
                    width={520}
                    height={520}
                    objectFit="contain"
                    className={cn(
                      s.cube,
                      index === rotation.index && s.cubeActive
                    )}
                  />
                ))}
              </span>
            </div>
            {bloom && (
              <Heart
                className={s.bloom}
                fill="currentColor"
                aria-hidden="true"
              />
            )}
            {/* The toast lives at the foot of the well, not of the card: at
                360px a card-anchored toast sits straight on top of the
                caption and the thread. */}
            {toast && (
              <output className={s.toast} data-toast>
                <span>{toast}</span>
                {toastCta && (
                  <Link className={s.toastCta} href={content.button.href}>
                    {content.post.saveToastCta}
                  </Link>
                )}
              </output>
            )}
          </div>
          <div className={s.cardFooter}>
            <div className={s.cardActions}>
              <button
                type="button"
                className={s.action}
                aria-label={content.post.like}
                aria-pressed={liked}
                onClick={onLike}
              >
                {/* A CSS animation only restarts when its name changes, and
                    this element persists — so the beat count's parity picks
                    the A/B animation and the alternation IS the trigger.
                    Remounting it instead would restart the fill transition. */}
                <span
                  className={cn(
                    s.heart,
                    beats > 0 && (beats % 2 === 1 ? s.heartBeatA : s.heartBeatB)
                  )}
                  style={{ '--fill': `${fill}%` } as CSSProperties}
                >
                  <Heart aria-hidden="true" />
                  <Heart
                    className={s.heartFill}
                    fill="currentColor"
                    aria-hidden="true"
                  />
                  {/* Mounted only for the completing press, so the animation
                      restarts by construction — no A/B name swap needed. */}
                  {burst && (
                    <span className={s.burst} aria-hidden="true">
                      {BURST_ANGLES.map((angle) => (
                        <i
                          key={angle}
                          style={{ '--a': `${angle}deg` } as CSSProperties}
                        />
                      ))}
                    </span>
                  )}
                </span>
              </button>
              <button
                type="button"
                className={s.action}
                aria-label={content.post.comment}
                aria-disabled={exhausted}
                onClick={onComment}
              >
                <MessageCircle aria-hidden="true" />
              </button>
              <button
                type="button"
                className={s.action}
                aria-label={content.post.share}
                onClick={onShare}
              >
                {/* Same A/B trick as the heart: the plane flies once per
                    activation, and only a change of animation name restarts
                    it on an element that persists. */}
                <Send
                  className={cn(
                    flights > 0 && (flights % 2 === 1 ? s.flyA : s.flyB)
                  )}
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                className={cn(s.action, s.cardSave)}
                aria-label={content.post.save}
                aria-pressed={saved}
                onClick={onSave}
              >
                <Bookmark
                  fill={saved ? 'currentColor' : 'none'}
                  aria-hidden="true"
                />
              </button>
            </div>
            <b className={s.cardLikes} aria-live="polite">
              {liked ? content.post.likesLiked : content.post.likes}
            </b>
            <p className={s.cardCaption}>
              <b>{content.post.handle}</b> {content.post.caption}
            </p>
            {thread.length > 0 && (
              <ul className={s.thread}>
                {thread.map((pair, index) => {
                  const isLatest = index === thread.length - 1
                  const answer = isLatest
                    ? pair.answer.slice(0, typed)
                    : pair.answer
                  return (
                    <li key={pair.question}>
                      <p className={s.threadLine}>
                        <b>{pair.author}</b> {pair.question}
                      </p>
                      <p className={cn(s.threadLine, s.threadReply)}>
                        <b>{content.post.handle}</b> {answer}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
