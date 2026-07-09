import type { Meta, StoryObj } from '@storybook/react'
import { Video } from './index'

const meta = {
  title: 'UI/Video',
  component: Video,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 480, maxWidth: '90vw' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    src: '/clips/hero.mp4',
    poster: '/clips/hero-poster.jpg',
    alt: 'Social Lama hero llama',
    aspectRatio: 1370 / 1080,
  },
} satisfies Meta<typeof Video>

export default meta

type Story = StoryObj<typeof meta>

/** Lazy autoplay: poster paints first, the clip plays once in view and loops. */
export const Default: Story = {}

/** Provides a mobile source/poster used when the mobile breakpoint matches at mount. */
export const ResponsiveSource: Story = {
  args: {
    mobileSrc: '/clips/hero-mobile.mp4',
    posterMobile: '/clips/hero-mobile-poster.jpg',
  },
}

/**
 * Poster-only rendering. `autoPlay={false}` takes the exact same code path as
 * `prefers-reduced-motion: reduce` — the poster renders through `<Image>` and no
 * `<video>` element is created.
 */
export const ReducedMotion: Story = {
  args: {
    autoPlay: false,
  },
}
