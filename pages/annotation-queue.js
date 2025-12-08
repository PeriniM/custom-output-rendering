import { useState, useEffect } from 'react'
import styles from '../styles/App.module.css'
import { parseConversation } from '../utils/conversation'
import ConversationTurn from '../components/ConversationTurn'
import PDFViewer from '../components/PDFViewer'

export default function AnnotationQueue() {
  const [messages, setMessages] = useState([])
  const [messageCount, setMessageCount] = useState(0)
  const [latestMessage, setLatestMessage] = useState(null)
  const [activeTab, setActiveTab] = useState('thread')

  useEffect(() => {
    const handleMessage = (event) => {
      // Log to console for debugging
      console.log('Received message from LangSmith (Annotation Queue):', event.data)
      
      const messageData = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        data: event.data,
      }
      
      setMessageCount((prev) => prev + 1)
      setMessages((prev) => [...prev, messageData])
      
      // Keep track of the latest message for conversation display
      if (event.data?.type === 'output' && event.data?.data?.messages) {
        setLatestMessage(event.data)
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // Parse the latest message into conversation turns
  const conversationTurns = latestMessage 
    ? parseConversation(latestMessage.data?.messages)
    : []

  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <h1>LangSmith Custom Output Renderer</h1>
        <p className={styles.subtitle}>Annotation Queue - Conversation View</p>
        {messageCount > 0 && (
          <div className={styles.messageCount}>
            Received {messageCount} message{messageCount !== 1 ? 's' : ''}
            {conversationTurns.length > 0 && (
              <span> • {conversationTurns.length} turn{conversationTurns.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        )}
      </header>

      <main className={styles.appMain}>
        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tab} ${activeTab === 'thread' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('thread')}
          >
            Thread
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'guidelines' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('guidelines')}
          >
            Guidelines
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'thread' ? (
          conversationTurns.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Waiting for messages from LangSmith...</p>
              <p className={styles.hint}>
                Configure this URL in your annotation queue settings.
              </p>
            </div>
          ) : (
            <div className={styles.conversationContainer}>
              {conversationTurns.map((turn, index) => (
                <ConversationTurn
                  key={index}
                  turn={turn}
                  turnNumber={turn.turnNumber}
                  fullPayload={latestMessage}
                />
              ))}
            </div>
          )
        ) : (
          <div className={styles.pdfContainer}>
            <PDFViewer pdfPath="/customer-support-guidelines.pdf" />
          </div>
        )}
      </main>
    </div>
  )
}

