import { defineStore } from 'pinia'
import { ref } from 'vue'
import { vapi, hasValidVapiConfig, assistantConfig, setupFunctionCallHandling } from '../config/vapi.js'

export const useVoiceStore = defineStore('voice', () => {
  const isConnected = ref(false)
  const isListening = ref(false)
  const isSpeaking = ref(false)
  const transcript = ref('')
  const messages = ref([])
  const error = ref(null)

  const startCall = async () => {
    try {
      error.value = null
      console.log('Starting VAPI call...')
      
      if (!hasValidVapiConfig || !vapi) {
        const errorMsg = 'Please configure your VAPI credentials in the .env file'
        error.value = errorMsg
        console.error('VAPI configuration error:', errorMsg)
        return
      }
      
      console.log('VAPI instance available, starting call with config:')
      console.log('Assistant config details:', {
        model: assistantConfig.model,
        voice: assistantConfig.voice,
        firstMessage: assistantConfig.firstMessage,
        functionsCount: assistantConfig.functions?.length
      })
      console.log('Functions:', assistantConfig.functions?.map(f => f.name))
      
      await vapi.start(assistantConfig)
      isConnected.value = true
      console.log('VAPI call started successfully')
    } catch (err) {
      console.error('Failed to start VAPI call:', err)
      
      let errorMsg = 'Failed to start voice call'
      
      // Handle Response objects
      if (err instanceof Response) {
        try {
          let responseText = ''
          
          // Check if the response body has already been consumed
          if (!err.bodyUsed) {
            responseText = await err.text()
          } else {
            console.warn('Response body already consumed, cannot read text')
          }
          
          console.error('Response error details:', {
            status: err.status,
            statusText: err.statusText,
            url: err.url,
            bodyUsed: err.bodyUsed,
            body: responseText
          })
          
          errorMsg = `API Error ${err.status}: ${err.statusText || 'Request failed'}`
          if (responseText) {
            try {
              const jsonError = JSON.parse(responseText)
              errorMsg += ` - ${jsonError.message || jsonError.error || responseText}`
            } catch {
              errorMsg += ` - ${responseText}`
            }
          }
        } catch (parseError) {
          console.error('Failed to parse response error:', parseError)
          errorMsg = 'Failed to connect to VAPI service'
        }
      } else {
        console.error('Error details:', {
          name: err.name,
          message: err.message,
          stack: err.stack
        })
        errorMsg = err.message || err.toString() || errorMsg
      }
      
      error.value = `VAPI error: ${errorMsg}`
    }
  }

  const endCall = async () => {
    try {
      await vapi.stop()
      isConnected.value = false
      isListening.value = false
      isSpeaking.value = false
    } catch (err) {
      error.value = err.message
      console.error('Failed to end VAPI call:', err)
    }
  }

  const sendMessage = async (message) => {
    try {
      if (isConnected.value) {
        await vapi.send({
          type: 'add-message',
          message: {
            role: 'user',
            content: message
          }
        })
        
        messages.value.push({
          role: 'user',
          content: message,
          timestamp: new Date()
        })
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to send message:', err)
    }
  }

  // Simple VAPI event listeners
  const setupEventListeners = () => {
    if (!vapi) return

    // Setup function call handling
    setupFunctionCallHandling()
    
    vapi.on('call-start', () => {
      isConnected.value = true
      console.log('Call started')
    })

    vapi.on('call-end', () => {
      isConnected.value = false
      isListening.value = false
      isSpeaking.value = false
      console.log('Call ended')
    })

    vapi.on('speech-start', () => {
      isListening.value = true
    })

    vapi.on('speech-end', () => {
      isListening.value = false
    })

    vapi.on('message', (message) => {
      console.log('Message received:', message)
      
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        transcript.value = message.transcript
        messages.value.push({
          role: 'user',
          content: message.transcript,
          timestamp: new Date()
        })
      }
      
      if (message.type === 'function-call') {
        let toolMessage = 'Processing...'
        if (message.functionCall?.name === 'get_current_time') {
          toolMessage = 'Getting current time...'
        } else if (message.functionCall?.name === 'calculate') {
          toolMessage = 'Calculating...'
        } else if (message.functionCall?.name === 'verify_pin') {
          toolMessage = 'Verifying PIN...'
        }
        
        messages.value.push({
          role: 'system',
          content: toolMessage,
          timestamp: new Date()
        })
      }
    })

    vapi.on('error', async (vapiError) => {
      console.error('VAPI error event:', vapiError)
      
      let errorMessage = 'Unknown error occurred'
      
      // Handle Response objects
      if (vapiError instanceof Response) {
        try {
          let responseText = ''
          
          // Check if the response body has already been consumed
          if (!vapiError.bodyUsed) {
            responseText = await vapiError.text()
          } else {
            console.warn('Response body already consumed, cannot read text')
          }
          
          console.error('Response error details:', {
            status: vapiError.status,
            statusText: vapiError.statusText,
            url: vapiError.url,
            bodyUsed: vapiError.bodyUsed,
            body: responseText
          })
          
          errorMessage = `API Error ${vapiError.status}: ${vapiError.statusText || 'Request failed'}`
          if (responseText) {
            try {
              const jsonError = JSON.parse(responseText)
              errorMessage += ` - ${jsonError.message || jsonError.error || responseText}`
            } catch {
              errorMessage += ` - ${responseText}`
            }
          }
        } catch (parseError) {
          console.error('Failed to parse response error:', parseError)
          errorMessage = `API Error: Failed to connect to VAPI service`
        }
      } else {
        console.error('Error details:', {
          type: typeof vapiError,
          message: vapiError?.message,
          code: vapiError?.code,
          details: vapiError
        })
        errorMessage = vapiError?.message || vapiError?.toString() || errorMessage
      }
      
      error.value = `VAPI error: ${errorMessage}`
    })
  }

  // Initialize event listeners
  setupEventListeners()

  return {
    isConnected,
    isListening,
    isSpeaking,
    transcript,
    messages,
    error,
    startCall,
    endCall,
    sendMessage
  }
})