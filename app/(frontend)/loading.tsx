import styles from './loading.module.css'

export default function Loading() {
  return (
    <div className={styles.root} role="status">
      <p className={styles.word} aria-hidden="true">
        sociallama
      </p>
      <span className={styles.bar} aria-hidden="true" />
      <span className="sr-only">Ładowanie…</span>
    </div>
  )
}
