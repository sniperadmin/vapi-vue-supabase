import Vapi from '@vapi-ai/web'
import { customTools, functionHandler } from './tools.js'

// VAPI Public Key - Replace with your actual key from https://dashboard.vapi.ai/
const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY

// Check if VAPI configuration is valid
export const hasValidVapiConfig = () => {
  const isValid = VAPI_PUBLIC_KEY && 
                  VAPI_PUBLIC_KEY !== 'your_vapi_public_key_here' &&
                  VAPI_PUBLIC_KEY.length > 10 && // Basic length check
                  VAPI_PUBLIC_KEY.includes('-') // UUID format check
  
  console.log('VAPI config validation:', {
    hasKey: !!VAPI_PUBLIC_KEY,
    keyLength: VAPI_PUBLIC_KEY?.length,
    keyPreview: VAPI_PUBLIC_KEY?.substring(0, 8) + '...',
    isPlaceholder: VAPI_PUBLIC_KEY === 'your_vapi_public_key_here',
    hasUuidFormat: VAPI_PUBLIC_KEY?.includes('-'),
    isValid
  })
  
  return isValid
}

// VAPI Instance with error handling
export const vapi = (() => {
  if (!hasValidVapiConfig()) {
    console.warn('VAPI not configured - missing or invalid public key')
    return null
  }
  
  try {
    console.log('Initializing VAPI with key:', VAPI_PUBLIC_KEY?.substring(0, 8) + '...')
    return new Vapi(VAPI_PUBLIC_KEY)
  } catch (error) {
    console.error('Failed to initialize VAPI:', error)
    return null
  }
})()

// Minimal VAPI Assistant Configuration
export const assistantConfig = {
  model: {
    provider: "openai",
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful voice assistant. IMPORTANT: You must ALWAYS verify the user's 6-digit PIN before taking any action. Follow these steps strictly: 1) If no PIN is provided, ask for it. 2) Use the verify_pin function to validate the PIN. 3) Only after successful PIN verification, proceed with the requested action. If verification fails, inform the user and ask for the correct PIN. Keep all responses brief and focused."
      }
    ]
  },
  voice: {
    provider: "playht",
    voiceId: "jennifer"
  },
  firstMessage: "Hello! How can I help you today?",
  functions: customTools
}

// Setup function call handling
export const setupFunctionCallHandling = () => {
  if (!vapi) return

  // Handle both function-call and tool-calls events for compatibility
  vapi.on('function-call', async (functionCall) => {
    console.log('Function call received:', functionCall)
    await handleFunctionCall(functionCall)
  })

  vapi.on('tool-calls', async (toolCalls) => {
    console.log('Tool calls received:', toolCalls)
    
    // Handle multiple tool calls
    if (Array.isArray(toolCalls)) {
      for (const toolCall of toolCalls) {
        await handleFunctionCall(toolCall)
      }
    } else {
      await handleFunctionCall(toolCalls)
    }
  })

  vapi.on('message', (message) => {
    console.log('VAPI Message:', message)
  })

  vapi.on('error', (error) => {
    console.error('VAPI Error:', error)
  })
}

// Helper function to handle individual function calls
async function handleFunctionCall(functionCall) {
  console.log('Processing function call:', functionCall)
  
  try {
    const functionName = functionCall.functionName || functionCall.function?.name
    const parameters = functionCall.parameters || functionCall.function?.arguments
    const callId = functionCall.functionCallId || functionCall.id
    
    console.log('Extracted:', { functionName, parameters, callId })
    
    if (!functionName) {
      throw new Error('Function name not found in call')
    }
    
    const result = await functionHandler(functionName, parameters)
    console.log('Function result:', result)
    
    // Ensure result is serializable
    const serializedResult = JSON.parse(JSON.stringify(result))
    
    // Send the result back to VAPI
    vapi.send({
      type: 'function-result',
      functionCallId: callId,
      result: serializedResult
    })
    
    console.log('Function result sent successfully for:', functionName)
  } catch (error) {
    console.error('Function call error:', error)
    
    // Send error back to VAPI with proper format
    const errorResponse = {
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }
    
    const callId = functionCall.functionCallId || functionCall.id
    
    vapi.send({
      type: 'function-result',
      functionCallId: callId,
      result: errorResponse
    })
  }
}