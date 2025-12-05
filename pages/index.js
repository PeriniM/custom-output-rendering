import { useState, useEffect } from 'react'
import styles from '../styles/App.module.css'

// Parse messages into conversation turns
function parseConversation(messages) {
  if (!messages || !Array.isArray(messages)) return []
  
  const turns = []
  let currentTurn = null
  
  for (const msg of messages) {
    if (msg.type === 'human') {
      // Start a new turn
      if (currentTurn) {
        turns.push(currentTurn)
      }
      currentTurn = {
        human: msg,
        ai: null,
        turnNumber: turns.length + 1
      }
    } else if (msg.type === 'ai' && currentTurn) {
      // Complete the current turn
      currentTurn.ai = msg
      turns.push(currentTurn)
      currentTurn = null
    }
  }
  
  // Add the last turn if it exists
  if (currentTurn) {
    turns.push(currentTurn)
  }
  
  return turns
}

// Extract text content from AI message
function extractAIContent(aiMessage) {
  if (!aiMessage || !aiMessage.content) return ''
  
  if (typeof aiMessage.content === 'string') {
    return aiMessage.content
  }
  
  if (Array.isArray(aiMessage.content)) {
    return aiMessage.content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n')
  }
  
  return ''
}

// Format token usage
function formatTokenUsage(usage) {
  if (!usage) return null
  
  return {
    input: usage.input_tokens || 0,
    output: usage.output_tokens || 0,
    total: usage.total_tokens || 0,
    cacheRead: usage.input_token_details?.cache_read || 0,
    cacheCreation: usage.input_token_details?.cache_creation || 0
  }
}

function ConversationTurn({ turn, turnNumber, fullPayload }) {
  const [showRaw, setShowRaw] = useState(false)
  
  const humanContent = turn.human?.content || ''
  const aiContent = extractAIContent(turn.ai)
  const modelInfo = turn.ai?.response_metadata || {}
  const usage = formatTokenUsage(turn.ai?.usage_metadata)
  
  return (
    <div className={styles.turn}>
      <div className={styles.turnHeader}>
        <span className={styles.turnNumber}>Turn {turnNumber}</span>
        <button 
          className={styles.rawToggle}
          onClick={() => setShowRaw(!showRaw)}
        >
          {showRaw ? 'Hide' : 'Show'} Raw Payload
        </button>
      </div>
      
      {showRaw && (
        <div className={styles.rawPayload}>
          <pre className={styles.jsonDisplay}>
            {JSON.stringify(fullPayload, null, 2)}
          </pre>
        </div>
      )}
      
      <div className={styles.turnContent}>
        {/* Human Message */}
        <div className={styles.messageBubble + ' ' + styles.humanMessage}>
          <div className={styles.messageLabel}>User</div>
          <div className={styles.messageText}>{humanContent}</div>
        </div>
        
        {/* AI Message */}
        {turn.ai && (
          <div className={styles.messageBubble + ' ' + styles.aiMessage}>
            <div className={styles.messageLabel}>
              Assistant
              {modelInfo.model_name && (
                <span className={styles.modelInfo}>
                  {' • '}
                  <span className={styles.modelName}>{modelInfo.model_name}</span>
                  {modelInfo.model_provider && (
                    <span className={styles.modelProvider}> ({modelInfo.model_provider})</span>
                  )}
                </span>
              )}
            </div>
            <div className={styles.messageText}>{aiContent}</div>
            
            {/* Token Usage and Metadata */}
            {(usage || modelInfo.stop_reason) && (
              <div className={styles.messageMetadata}>
                {usage && (
                  <div className={styles.tokenUsage}>
                    <span className={styles.tokenLabel}>Tokens:</span>
                    <span className={styles.tokenValue}>
                      {usage.input.toLocaleString()} in / {usage.output.toLocaleString()} out
                      {' '}({usage.total.toLocaleString()} total)
                    </span>
                    {usage.cacheRead > 0 && (
                      <span className={styles.cacheInfo}>
                        {' • '}Cache: {usage.cacheRead} read, {usage.cacheCreation} created
                      </span>
                    )}
                  </div>
                )}
                {modelInfo.stop_reason && (
                  <div className={styles.stopReason}>
                    Stop reason: <span className={styles.stopValue}>{modelInfo.stop_reason}</span>
                  </div>
                )}
                {turn.ai.tool_calls && turn.ai.tool_calls.length > 0 && (
                  <div className={styles.toolCalls}>
                    Tool calls: {turn.ai.tool_calls.length}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const [messages, setMessages] = useState([])
  const [messageCount, setMessageCount] = useState(0)
  const [latestMessage, setLatestMessage] = useState(null)

  useEffect(() => {
    const handleMessage = (event) => {
      // Log to console for debugging
      console.log('Received message from LangSmith:', event.data)
      
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
        {conversationTurns.length === 0 ? (
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
        )}
      </main>
    </div>
  )
}
