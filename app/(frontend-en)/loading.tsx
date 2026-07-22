import styles from '@/app/(frontend)/loading.module.css'

/** English loading boundary for the `(frontend-en)` tree (mirrors the PL group). */
export default function Loading() {
  return (
    <div className={styles.root} role="status">
      <p className={styles.word} aria-hidden="true">
        sociallama
      </p>
      <span className={styles.bar} aria-hidden="true" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}
