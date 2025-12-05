import { useState } from 'react'
import styles from '../styles/App.module.css'
import { extractAIContent, extractHumanContent, formatTokenUsage } from '../utils/conversation'

export default function ConversationTurn({ turn, turnNumber, fullPayload }) {
  const [showRaw, setShowRaw] = useState(false)
  
  const humanContent = extractHumanContent(turn.human)
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

