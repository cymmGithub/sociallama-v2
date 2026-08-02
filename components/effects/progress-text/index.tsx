'use client'

import cn from 'clsx'
import { type UseScrollTriggerOptions, useScrollTrigger } from 'hamo'
import { Fragment, type ReactNode, useRef } from 'react'
import { slugify } from '@/utils/strings'
import s from './progress-text.module.css'

const TRANSITION = '600ms opacity ease-out'

type ProgressTextProps = {
  /** Plain text; split on spaces so each word can fade in on its own. */
  children: ReactNode
  start: UseScrollTriggerOptions['start']
  end: UseScrollTriggerOptions['end']
  onChange?: (node: HTMLSpanElement, value: boolean) => void
  className?: string
}

function defaultOnChange(node: HTMLSpanElement, value: boolean) {
  node.style.opacity = String(value ? 1 : 0.33)
}

export function ProgressText({
  children,
  start = 'top top',
  end = 'bottom bottom',
  onChange = defaultOnChange,
  className,
}: ProgressTextProps) {
  const wordsRefs = useRef<HTMLSpanElement[]>([])
  // Last value passed to onChange per word, so scroll frames only touch the
  // words that crossed their threshold instead of restyling every word.
  const lastValues = useRef<boolean[]>([])

  const [setRectRef] = useScrollTrigger({
    start,
    end,
    onProgress: ({ progress }) => {
      wordsRefs.current.forEach((node, i) => {
        const value = progress > i / wordsRefs.current.length
        if (lastValues.current[i] === value) return
        lastValues.current[i] = value
        onChange?.(node, value)
      })
    },
  })

  const words =
    typeof children === 'string' ? children.split(' ').filter(Boolean) : []

  if (words.length === 0) {
    return children
  }

  return (
    <span
      ref={setRectRef}
      className={cn(s.progressText, className)}
      style={{ '--transition': TRANSITION }}
    >
      {words.map((word, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: word list derived from static children, order never changes
        <Fragment key={`${slugify(word)}-${index}`}>
          <span
            className={s.word}
            ref={(node) => {
              if (!node) return
              wordsRefs.current[index] = node
            }}
            style={{ opacity: 0.33 }}
          >
            {word}
          </span>{' '}
        </Fragment>
      ))}
    </span>
  )
}
