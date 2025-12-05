import { useState, useEffect } from 'react'
import styles from '../styles/App.module.css'
import { parseConversation, parseDatasetFormat } from '../utils/conversation'
import ConversationTurn from '../components/ConversationTurn'

export default function Dataset() {
  const [messages, setMessages] = useState([])
  const [messageCount, setMessageCount] = useState(0)
  const [latestMessage, setLatestMessage] = useState(null)
  const [showRawPayload, setShowRawPayload] = useState(true) // Show raw payload by default

  useEffect(() => {
    const handleMessage = (event) => {
      // Log to console for debugging
      console.log('Received message from LangSmith (Dataset):', event.data)
      
      const messageData = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        data: event.data,
      }
      
      setMessageCount((prev) => prev + 1)
      setMessages((prev) => [...prev, messageData])
      
      // Keep track of the latest message for conversation display
      // Dataset payloads can be either "output" or "reference" type
      if ((event.data?.type === 'output' || event.data?.type === 'reference')) {
        setLatestMessage(event.data)
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // Parse the latest message into conversation turns
  // Dataset format: data.output (single message) + metadata.inputs
  // Annotation queue format: data.messages (array of messages)
  let conversationTurns = []
  
  if (latestMessage) {
    // Try dataset format first (data.output)
    if (latestMessage.data?.output) {
      conversationTurns = parseDatasetFormat(latestMessage)
    }
    // Fallback to annotation queue format (data.messages)
    else if (latestMessage.data?.messages) {
      conversationTurns = parseConversation(latestMessage.data.messages)
    }
  }

  const messageType = latestMessage?.type || 'output'
  const isReference = messageType === 'reference'

  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <h1>LangSmith Custom Output Renderer</h1>
        <p className={styles.subtitle}>
          Dataset - {isReference ? 'Reference Output' : 'Run Output'} View
        </p>
        {messageCount > 0 && (
          <div className={styles.messageCount}>
            Received {messageCount} message{messageCount !== 1 ? 's' : ''}
            {isReference && (
              <span className={styles.referenceBadge}> • Reference</span>
            )}
            {conversationTurns.length > 0 && (
              <span> • {conversationTurns.length} turn{conversationTurns.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        )}
      </header>

      <main className={styles.appMain}>
        {!latestMessage ? (
          <div className={styles.emptyState}>
            <p>Waiting for messages from LangSmith...</p>
            <p className={styles.hint}>
              Configure this URL in your dataset settings.
            </p>
          </div>
        ) : (
          <>
            {/* Raw Payload Display */}
            <div className={styles.rawPayloadSection}>
              <div className={styles.rawPayloadHeader}>
                <h2>Raw Payload</h2>
                <button 
                  className={styles.rawToggle}
                  onClick={() => setShowRawPayload(!showRawPayload)}
                >
                  {showRawPayload ? 'Hide' : 'Show'} Raw Payload
                </button>
              </div>
              {showRawPayload && (
                <div className={styles.rawPayload}>
                  <pre className={styles.jsonDisplay}>
                    {JSON.stringify(latestMessage, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Conversation Display */}
            {conversationTurns.length > 0 ? (
              <div className={styles.conversationContainer}>
                <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>Conversation View</h2>
                {conversationTurns.map((turn, index) => (
                  <ConversationTurn
                    key={index}
                    turn={turn}
                    turnNumber={turn.turnNumber}
                    fullPayload={latestMessage}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No conversation messages found in payload.</p>
                <p className={styles.hint}>
                  Check the raw payload above to see the data structure.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

