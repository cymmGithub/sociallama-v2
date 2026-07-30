import { Link } from '@/components/ui/link'
import type { LocalizedConsent } from '@/lib/content/consent'
import s from './cookie-table.module.css'

/**
 * The cookie disclosure table for Artykuł 7 of the privacy policy.
 *
 * Rendered from `consentCategories` — the same array that drives the consent
 * settings panel — because two hand-maintained lists of vendors WILL drift, and
 * the drift is invisible until somebody audits it (design.md Decision 12). A
 * policy that declares cookies the site does not set, or omits ones it does, is
 * a defect that reading rarely catches.
 *
 * The e2e suite closes the loop from the other end: it enumerates the cookies
 * actually present after acceptance and asserts the set matches this data
 * exactly, in both directions.
 *
 * A server component — no interactivity, and the policy pages are static.
 */
export function CookieTable({
  categories,
  labels,
}: {
  categories: LocalizedConsent['consentCategories']
  labels: LocalizedConsent['consentTable']
}) {
  return (
    // Five columns do not fit a phone. The scroll is scoped to the table so the
    // page body itself never scrolls horizontally.
    <div className={s.scroll}>
      <table className={s.table}>
        <thead>
          <tr>
            <th scope="col">{labels.category}</th>
            <th scope="col">{labels.vendor}</th>
            <th scope="col">{labels.cookie}</th>
            <th scope="col">{labels.purpose}</th>
            <th scope="col">{labels.retention}</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            const categoryRows = category.vendors.flatMap(
              (vendor) => vendor.cookies
            ).length

            return category.vendors.map((vendor, vendorIndex) =>
              vendor.cookies.map((cookie, cookieIndex) => (
                <tr key={`${vendor.name}-${cookie.name}`}>
                  {vendorIndex === 0 && cookieIndex === 0 && (
                    <th scope="rowgroup" rowSpan={categoryRows}>
                      {category.name}
                    </th>
                  )}
                  {cookieIndex === 0 && (
                    <td rowSpan={vendor.cookies.length}>
                      {vendor.name}
                      <span className={s.provider}>{vendor.provider}</span>
                      <Link className={s.policy} href={vendor.privacyHref}>
                        {vendor.privacyHref}
                      </Link>
                    </td>
                  )}
                  <td>
                    <code className={s.cookieName}>{cookie.name}</code>
                  </td>
                  <td>{cookie.purpose}</td>
                  <td>{cookie.retention}</td>
                </tr>
              ))
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
