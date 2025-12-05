import Link from 'next/link'
import styles from '../styles/App.module.css'

export default function Home() {
  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <h1>LangSmith Custom Output Renderer</h1>
        <p className={styles.subtitle}>Select your endpoint</p>
      </header>

      <main className={styles.appMain}>
        <div className={styles.endpointSelector}>
          <div className={styles.endpointCard}>
            <h2>Annotation Queue</h2>
            <p>Use this endpoint for annotation queues in LangSmith</p>
            <Link href="/annotation-queue" className={styles.endpointLink}>
              <span className={styles.endpointPath}>/annotation-queue</span>
              <span className={styles.endpointArrow}>→</span>
            </Link>
            <div className={styles.endpointInfo}>
              <p>Configure in: Annotation Queue Settings</p>
              <p>Displays conversation turns with model info and token usage</p>
            </div>
          </div>

          <div className={styles.endpointCard}>
            <h2>Dataset</h2>
            <p>Use this endpoint for datasets in LangSmith</p>
            <Link href="/dataset" className={styles.endpointLink}>
              <span className={styles.endpointPath}>/dataset</span>
              <span className={styles.endpointArrow}>→</span>
            </Link>
            <div className={styles.endpointInfo}>
              <p>Configure in: Dataset Settings</p>
              <p>Supports both output and reference outputs</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
