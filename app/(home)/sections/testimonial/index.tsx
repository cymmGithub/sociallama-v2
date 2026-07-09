'use client'

import { featuredTestimonial } from '@/lib/content/home'
import { useReveal } from '@/lib/hooks/use-reveal'
import s from './testimonial.module.css'

export function Testimonial() {
  const ref = useReveal<HTMLElement>()

  return (
    <section ref={ref} className={s.section}>
      <figure className={s.figure}>
        <blockquote data-reveal-item className={s.quote}>
          “{featuredTestimonial.quote}”
        </blockquote>
        <figcaption data-reveal-item className={s.caption}>
          <span className={s.author}>{featuredTestimonial.author}</span>
          <span className={s.company}>{featuredTestimonial.company}</span>
        </figcaption>
      </figure>
    </section>
  )
}
