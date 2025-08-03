import { supabase } from './supabase.js'

// Simple tool configuration for VAPI function calling
export const customTools = [
  {
    name: 'get_current_time',
    description: 'Get the current time in a specified format and timezone',
    parameters: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          description: 'Time format (12h or 24h)',
          enum: ['12h', '24h']
        },
        timezone: {
          type: 'string',
          description: 'Timezone (e.g., UTC, EST, PST)'
        }
      }
    }
  },
  {
    name: 'verify_pin',
    description: 'Verify user PIN code for authentication',
    parameters: {
      type: 'object',
      properties: {
        pin: {
          type: 'string',
          description: 'The 6-digit PIN code to verify'
        }
      },
      required: ['pin']
    }
  },
  {
    name: 'send_webhook_notification',
    description: 'Send a POST request to the n8n webhook with custom data',
    parameters: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'The message to send to the webhook'
        },
        data: {
          type: 'object',
          description: 'Additional data to include in the webhook payload'
        }
      },
      required: ['message']
    }
  },
  {
    name: 'debug_pin_input',
    description: 'Debug PIN input to see how VAPI is sending the PIN parameter',
    parameters: {
      type: 'object',
      properties: {
        pin: {
          type: 'string',
          description: 'The PIN to debug'
        }
      },
      required: ['pin']
    }
  }
]

// Simple function call handler for VAPI
export const functionHandler = async (functionName, parameters) => {
  console.log('Function handler called:', { name: functionName, parameters })
  console.log(`Executing function: ${functionName}`, parameters)
  
  try {
    switch (functionName) {
      case 'get_current_time':
        return await getCurrentTime(parameters)
      case 'verify_pin':
        console.log('Calling verify_pin with parameters:', parameters)
        return await verifyPin(parameters)
      case 'send_webhook_notification':
        console.log('Calling send_webhook_notification with parameters:', parameters)
        return await sendWebhookNotification(parameters)
      case 'debug_pin_input':
        console.log('Calling debug_pin_input with parameters:', parameters)
        return await debugPinInput(parameters)

      default:
        console.error('Unknown function called:', functionName)
        throw new Error(`Unknown function: ${functionName}`)
    }
  } catch (error) {
    console.error(`Error executing function ${functionName}:`, error)
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

// Webhook notification function
async function sendWebhookNotification({ message, data = {} }) {
  console.log('=== WEBHOOK NOTIFICATION STARTED ===')
  console.log('Received parameters:', { message, data })
  
  const webhookUrl = 'https://n8n.srv895165.hstgr.cloud/webhook-test/8b119bde-d23f-4f26-9bba-0987a1613929'
  
  try {
    // Prepare the payload
    const payload = {
      message: message,
      timestamp: new Date().toISOString(),
      source: 'vapi-function-call',
      ...data
    }
    
    console.log('Sending payload to webhook:', payload)
    
    // Send POST request to webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
    
    console.log('Webhook response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Webhook error response:', errorText)
      return {
        success: false,
        error: `Webhook request failed with status ${response.status}: ${errorText}`,
        timestamp: new Date().toISOString()
      }
    }
    
    const responseData = await response.text()
    console.log('Webhook response data:', responseData)
    
    return {
      success: true,
      message: 'Webhook notification sent successfully',
      webhook_url: webhookUrl,
      response_status: response.status,
      response_data: responseData,
      sent_payload: payload,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('Webhook notification error:', error)
    return {
      success: false,
      error: `Failed to send webhook notification: ${error.message}`,
      webhook_url: webhookUrl,
      timestamp: new Date().toISOString()
    }
  }
}

// Debug PIN input function
async function debugPinInput({ pin }) {
  console.log('=== DEBUG PIN INPUT ===')
  
  const analysis = {
    received_value: pin,
    type: typeof pin,
    length: pin ? String(pin).length : 0,
    is_string: typeof pin === 'string',
    is_number: typeof pin === 'number',
    raw_string: String(pin),
    digits_only: typeof pin === 'string' ? pin.replace(/\D/g, '') : String(pin),
    char_codes: typeof pin === 'string' ? pin.split('').map(c => c.charCodeAt(0)) : [],
    timestamp: new Date().toISOString()
  }
  
  console.log('PIN Analysis:', analysis)
  
  return {
    success: true,
    message: 'PIN input debug completed',
    analysis: analysis,
    recommendations: [
      'Check if PIN contains non-digit characters',
      'Verify PIN length is exactly 6 digits',
      'Ensure VAPI is sending the PIN as expected'
    ]
  }
}

// Debug function to check user profile
async function debugUserProfile() {
  console.log('=== DEBUG USER PROFILE ===')
  
  if (!supabase) {
    return {
      success: false,
      error: 'Database connection not available',
      timestamp: new Date().toISOString()
    }
  }

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'User not authenticated',
        user: null,
        timestamp: new Date().toISOString()
      }
    }

    console.log('Current user:', {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    })

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    console.log('Profile query result:', {
      profile: profile,
      error: profileError
    })

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      profile: profile,
      profileError: profileError,
      hasPinSet: !!profile?.pin_code,
      pinLength: profile?.pin_code?.length,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Debug error:', error)
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

// PIN verification function
async function verifyPin({ pin }) {
  console.log('=== PIN VERIFICATION STARTED ===')
  console.log('Received PIN parameter:', { pin, type: typeof pin, raw: pin })
  
  if (!supabase) {
    console.error('Supabase client not available')
    return {
      success: false,
      error: 'Database connection not available',
      timestamp: new Date().toISOString()
    }
  }

  try {
    // Handle different PIN input formats from VAPI
    let pinString = ''
    
    if (typeof pin === 'number') {
      pinString = String(pin).padStart(6, '0') // Pad with leading zeros if needed
    } else if (typeof pin === 'string') {
      // Remove any non-digit characters and spaces
      pinString = pin.replace(/\D/g, '')
    } else {
      console.log('PIN is not a string or number:', typeof pin)
      return {
        success: false,
        error: 'PIN must be a 6-digit number',
        timestamp: new Date().toISOString()
      }
    }
    
    console.log('Processed PIN:', { original: pin, processed: pinString, length: pinString.length })
    
    // Validate PIN format
    if (pinString.length !== 6 || !/^\d{6}$/.test(pinString)) {
      console.log('PIN validation failed - not 6 digits:', { pinString, length: pinString.length })
      return {
        success: false,
        error: `PIN must be exactly 6 digits. Received: ${pinString.length} digits`,
        debug: { received: pin, processed: pinString },
        timestamp: new Date().toISOString()
      }
    }
    
    console.log('PIN format validation passed')

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'User not authenticated. Please log in first.',
        timestamp: new Date().toISOString()
      }
    }

    // Query user profile for PIN
    const { data, error } = await supabase
      .from('user_profiles')
      .select('pin_code')
      .eq('id', user.id)
      .single()

    if (error || !data) {
      return {
        success: false,
        error: 'User profile not found. Please set up your profile first.',
        timestamp: new Date().toISOString()
      }
    }

    if (!data.pin_code) {
      return {
        success: false,
        error: 'No PIN code set. Please create a PIN first.',
        timestamp: new Date().toISOString()
      }
    }

    // Compare PINs
    const storedPinString = String(data.pin_code)
    const isValidPin = storedPinString === pinString
    
    if (!isValidPin) {
      console.log('PIN verification failed for user:', user.id)
      return {
        success: false,
        error: 'Invalid PIN code. Please try again.',
        timestamp: new Date().toISOString()
      }
    }

    console.log('PIN verified successfully for user:', user.id)
    return {
      success: true,
      message: 'PIN verified successfully',
      user_id: user.id,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('PIN verification error:', error)
    return {
      success: false,
      error: `Verification failed: ${error.message}`,
      timestamp: new Date().toISOString()
    }
  }
}



// Simple function implementation
async function getCurrentTime({ format = '12-hour', timezone = 'local' }) {
  try {
    const now = new Date()
    
    let timeString
    if (format === '24-hour') {
      timeString = now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } else {
      timeString = now.toLocaleTimeString('en-US', { 
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
      })
    }
    
    const dateString = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    return {
      success: true,
      current_time: timeString,
      current_date: dateString,
      full_datetime: `${dateString} at ${timeString}`,
      timestamp: now.toISOString(),
      timezone: timezone === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : timezone
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}