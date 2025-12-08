import { useState, useEffect } from 'react'
import styles from '../styles/App.module.css'
import MedicalRecordViewer from '../components/MedicalRecordViewer'

export default function Medical() {
  const [payload, setPayload] = useState(null)
  const [messageCount, setMessageCount] = useState(0)

  useEffect(() => {
    const handleMessage = (event) => {
      console.log('Received message from LangSmith (Medical):', event.data)
      
      setMessageCount((prev) => prev + 1)
      
      if (event.data?.type === 'output' || event.data?.type === 'reference') {
        setPayload(event.data)
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <h1>LangSmith Custom Output Renderer</h1>
        <p className={styles.subtitle}>Medical Records - Domain-Specific Formatting</p>
        {messageCount > 0 && (
          <div className={styles.messageCount}>
            Received {messageCount} message{messageCount !== 1 ? 's' : ''}
          </div>
        )}
      </header>

      <main className={styles.appMain}>
        {!payload ? (
          <div className={styles.emptyState}>
            <p>Waiting for medical record data from LangSmith...</p>
            <p className={styles.hint}>
              This endpoint demonstrates domain-specific formatting for medical records.
            </p>
          </div>
        ) : (
          <MedicalRecordViewer payload={payload} />
        )}
      </main>
    </div>
  )
}

