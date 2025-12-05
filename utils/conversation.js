// Parse messages into conversation turns
export function parseConversation(messages) {
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
export function extractAIContent(aiMessage) {
  if (!aiMessage || !aiMessage.content) return ''
  
  // Handle string content
  if (typeof aiMessage.content === 'string') {
    return aiMessage.content
  }
  
  // Handle array content
  if (Array.isArray(aiMessage.content)) {
    return aiMessage.content
      .map(item => {
        // If item is a string, return it
        if (typeof item === 'string') {
          return item
        }
        // If item is an object with text property
        if (item && typeof item === 'object' && item.text) {
          return item.text
        }
        // If item is an object with type 'text'
        if (item && typeof item === 'object' && item.type === 'text' && item.text) {
          return item.text
        }
        // Fallback: stringify the item
        return JSON.stringify(item)
      })
      .filter(text => text) // Remove empty strings
      .join('\n')
  }
  
  // Handle object content - try to extract text
  if (typeof aiMessage.content === 'object' && aiMessage.content !== null) {
    if (aiMessage.content.text) {
      return String(aiMessage.content.text)
    }
    // Fallback: stringify the object
    return JSON.stringify(aiMessage.content)
  }
  
  return ''
}

// Extract text content from human message
export function extractHumanContent(humanMessage) {
  if (!humanMessage || !humanMessage.content) return ''
  
  // Handle string content
  if (typeof humanMessage.content === 'string') {
    return humanMessage.content
  }
  
  // Handle array content
  if (Array.isArray(humanMessage.content)) {
    return humanMessage.content
      .map(item => {
        if (typeof item === 'string') {
          return item
        }
        if (item && typeof item === 'object' && item.text) {
          return item.text
        }
        return JSON.stringify(item)
      })
      .filter(text => text)
      .join('\n')
  }
  
  // Handle object content
  if (typeof humanMessage.content === 'object' && humanMessage.content !== null) {
    if (humanMessage.content.text) {
      return String(humanMessage.content.text)
    }
    return JSON.stringify(humanMessage.content)
  }
  
  return ''
}

// Parse dataset format (data.output or data.output_answer + metadata.inputs)
export function parseDatasetFormat(payload) {
  if (!payload || !payload.data) return []
  
  // Handle both regular output (data.output) and reference output (data.output_answer)
  let output = payload.data.output
  
  // If no output, check for output_answer (reference format)
  if (!output && payload.data.output_answer) {
    // Convert reference output string to AI message format
    output = {
      type: 'ai',
      content: payload.data.output_answer,
      response_metadata: {},
      usage_metadata: null
    }
  }
  
  const inputs = payload.metadata?.inputs || {}
  
  // Extract input question/text from various possible fields
  let inputText = ''
  if (inputs.input_question) {
    inputText = inputs.input_question
  } else if (inputs.question) {
    inputText = inputs.question
  } else if (inputs.input) {
    inputText = typeof inputs.input === 'string' ? inputs.input : JSON.stringify(inputs.input)
  } else if (inputs.messages && Array.isArray(inputs.messages)) {
    // If inputs has messages array, extract text from first message
    const firstMessage = inputs.messages[0]
    if (firstMessage?.content) {
      inputText = typeof firstMessage.content === 'string' 
        ? firstMessage.content 
        : JSON.stringify(firstMessage.content)
    }
  } else {
    // Fallback: stringify the inputs object
    inputText = JSON.stringify(inputs)
  }
  
  // Create a human message from the input
  const humanMessage = {
    type: 'human',
    content: inputText
  }
  
  // Create turn if we have both input and output
  if (output && inputText) {
    return [{
      human: humanMessage,
      ai: output,
      turnNumber: 1
    }]
  }
  
  // If only output exists, create a turn with just AI
  if (output) {
    return [{
      human: null,
      ai: output,
      turnNumber: 1
    }]
  }
  
  return []
}

// Format token usage
export function formatTokenUsage(usage) {
  if (!usage) return null
  
  return {
    input: usage.input_tokens || 0,
    output: usage.output_tokens || 0,
    total: usage.total_tokens || 0,
    cacheRead: usage.input_token_details?.cache_read || 0,
    cacheCreation: usage.input_token_details?.cache_creation || 0
  }
}

