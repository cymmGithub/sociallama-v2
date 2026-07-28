import type { FormState } from '@/lib/types/form'

/**
 * Initial `useActionState` value for both newsletter forms.
 *
 * `newsletterResult` used to live here too, mapping the action's placeholder
 * keys to Polish copy. It moved into `components/blog/newsletter.tsx` when
 * that component started taking its copy per locale — a module-scope map to
 * one language cannot serve two.
 */
export const NEWSLETTER_INITIAL: FormState = { status: 0, message: '' }
