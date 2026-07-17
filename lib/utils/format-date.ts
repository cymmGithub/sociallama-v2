/**
 * Post dates as rendered across the site (blog cards, post pages, NewsLAMA).
 * Dependency-free so both server and client components can import it.
 */
export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
