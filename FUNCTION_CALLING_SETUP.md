# VAPI Function Calling Setup Guide

This guide explains how to set up and use custom function calling with VAPI to enable your AI assistant to interact with external APIs and services.

## 🔧 Overview

The function calling system allows your VAPI assistant to:
- Make HTTP requests to external APIs
- Get real-time weather information
- Search the web for information
- Access user profile data
- Verify user PIN codes
- Execute custom business logic

## 📁 Project Structure

```
├── src/
│   ├── config/
│   │   ├── tools.js          # Function definitions and handlers
│   │   └── vapi.js           # VAPI configuration with tools
│   └── stores/
│       └── voice.js          # Voice store with function call handling
├── server/
│   ├── index.js              # Express.js server for function handling
│   ├── package.json          # Server dependencies
│   └── .env.example          # Server environment variables
└── FUNCTION_CALLING_SETUP.md # This guide
```

## 🚀 Quick Start

### 1. Install Server Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

**Main Application (.env):**
```env
# Function Server Configuration
VITE_FUNCTION_SERVER_URL=http://localhost:3001/api
VITE_FUNCTION_SERVER_SECRET=your-secret-key

# External API Keys (Optional)
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
```

**Server Configuration (server/.env):**
```env
PORT=3001
VITE_FUNCTION_SERVER_SECRET=your-secret-key
OPENWEATHER_API_KEY=your_openweather_api_key
```

### 3. Start the Function Server

```bash
cd server
npm run dev
```

### 4. Start the Main Application

```bash
npm run dev
```

## 🛠️ Available Functions

### 1. `make_api_request`
Make HTTP requests to any external API.

**Parameters:**
- `url` (required): The API endpoint URL
- `method` (optional): HTTP method (GET, POST, PUT, DELETE, PATCH)
- `headers` (optional): HTTP headers object
- `body` (optional): Request body for POST/PUT/PATCH
- `timeout` (optional): Request timeout in milliseconds

**Example Usage:**
```javascript
// The AI can call this function like:
"Can you fetch data from https://api.example.com/users"
```

### 2. `get_weather`
Get current weather information for any location.

**Parameters:**
- `location` (required): City and country (e.g., "London, UK")
- `units` (optional): Temperature units (metric, imperial, kelvin)

**Example Usage:**
```javascript
// User can ask:
"What's the weather like in New York?"
"Tell me the temperature in Tokyo in Celsius"
```

### 3. `search_web`
Search the web for information.

**Parameters:**
- `query` (required): Search query string
- `limit` (optional): Maximum number of results (1-10)

**Example Usage:**
```javascript
// User can ask:
"Search for the latest news about AI"
"Find information about Vue.js 3"
```

### 4. `get_user_profile`
Get current user profile information.

**Parameters:**
- `include_pin_status` (optional): Include PIN status information

**Example Usage:**
```javascript
// User can ask:
"Show me my profile information"
"Do I have a PIN set up?"
```

### 5. `verify_user_pin`
Verify a user's PIN code.

**Parameters:**
- `pin` (required): 6-digit PIN code to verify

**Example Usage:**
```javascript
// User can ask:
"Verify my PIN: 123456"
"Check if my PIN 654321 is correct"
```

## 🔧 Adding Custom Functions

### 1. Define the Function Schema

Add your function to `src/config/tools.js`:

```javascript
{
  type: 'function',
  function: {
    name: 'your_custom_function',
    description: 'Description of what your function does',
    parameters: {
      type: 'object',
      properties: {
        param1: {
          type: 'string',
          description: 'Description of parameter 1'
        },
        param2: {
          type: 'number',
          description: 'Description of parameter 2',
          default: 10
        }
      },
      required: ['param1']
    }
  }
}
```

### 2. Implement the Function Handler

Add the handler to the `FunctionCallHandler` class:

```javascript
async handleYourCustomFunction({ param1, param2 = 10 }) {
  try {
    // Your custom logic here
    const result = await someApiCall(param1, param2)
    
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}
```

### 3. Add Server Endpoint (Optional)

If you need server-side processing, add an endpoint to `server/index.js`:

```javascript
app.post('/api/your-custom-endpoint', verifyVapiRequest, async (req, res) => {
  const { param1, param2 } = req.body
  const result = await handleYourCustomFunction({ param1, param2 })
  res.json(result)
})
```

## 🔐 Security Considerations

### 1. Authentication
- All function calls are authenticated using the `VITE_FUNCTION_SERVER_SECRET`
- Server verifies the secret before processing requests
- User authentication tokens are passed for user-specific operations

### 2. Input Validation
- All function parameters are validated according to their schemas
- Server-side validation prevents malicious inputs
- Rate limiting can be implemented for production use

### 3. Error Handling
- All functions return structured error responses
- Sensitive information is not exposed in error messages
- Timeouts prevent hanging requests

## 📊 Monitoring and Debugging

### 1. Console Logs
Function calls are logged in the browser console:
```javascript
console.log('Function call received:', functionCall)
console.log('Function call result sent:', result)
```

### 2. Message History
Function calls appear in the conversation history with special indicators:
- 🔧 Function execution
- 📊 Function results
- ⚙️ System messages

### 3. Server Logs
The Express.js server logs all function calls and their results.

## 🌐 External API Integration

### Weather API (OpenWeatherMap)
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your API key
3. Add it to your environment variables:
   ```env
   VITE_OPENWEATHER_API_KEY=your_api_key
   OPENWEATHER_API_KEY=your_api_key
   ```

### Search API
Integrate with your preferred search API:
- Google Custom Search API
- Bing Search API
- DuckDuckGo API
- Custom search implementation

### Database Integration
Connect to your database for user-specific functions:
- Supabase (already integrated)
- PostgreSQL
- MongoDB
- Firebase

## 🚀 Production Deployment

### 1. Environment Variables
Set all required environment variables in your production environment.

### 2. Server Deployment
Deploy the Express.js server to:
- Heroku
- Vercel
- Railway
- AWS Lambda
- Your own VPS

### 3. CORS Configuration
Update CORS settings for your production domains:
```javascript
app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true
}))
```

### 4. Rate Limiting
Implement rate limiting for production:
```javascript
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

app.use('/api/', limiter)
```

## 🐛 Troubleshooting

### Common Issues

1. **Function calls not working**
   - Check if the function server is running
   - Verify environment variables are set correctly
   - Check browser console for errors

2. **Authentication errors**
   - Ensure `VITE_FUNCTION_SERVER_SECRET` matches on both client and server
   - Check if the secret is properly set in environment variables

3. **API rate limits**
   - Implement proper rate limiting
   - Cache API responses when appropriate
   - Use API keys with sufficient quotas

4. **CORS errors**
   - Update CORS configuration in the server
   - Ensure the server URL is correct in client configuration

### Debug Mode
Enable debug mode by setting:
```env
DEBUG=true
```

This will provide more detailed logging for troubleshooting.

## 📚 Additional Resources

- [VAPI Documentation](https://docs.vapi.ai/)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [Express.js Documentation](https://expressjs.com/)
- [Axios Documentation](https://axios-http.com/)

## 🤝 Contributing

To add new functions or improve existing ones:

1. Fork the repository
2. Create a feature branch
3. Add your function definition and handler
4. Test thoroughly
5. Submit a pull request

## 📄 License

This function calling system is part of the Vue Supabase VAPI application and follows the same license terms.