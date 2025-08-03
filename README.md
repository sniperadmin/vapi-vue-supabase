# Vue Supabase VAPI App

A modern Vue.js application with Supabase authentication and VAPI voice interaction capabilities.

## Features

- 🔐 **Supabase Authentication** - Secure user registration and login
- 🎤 **Voice Interactions** - Real-time voice conversations with AI assistant
- 💬 **Text & Voice Chat** - Switch between text and voice seamlessly
- 🎨 **Modern UI** - Beautiful, responsive design with smooth animations
- 📱 **Mobile Friendly** - Optimized for all device sizes

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials in `.env`:

#### Supabase Setup:
- Go to [Supabase](https://supabase.com)
- Create a new project
- Go to Settings > API
- Copy your Project URL and anon public key

#### VAPI Setup:
- Go to [VAPI](https://vapi.ai)
- Create an account and get your public key
- Add it to your `.env` file

### 3. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── AuthForm.vue          # Authentication form component
│   └── VoiceInterface.vue    # Voice interaction interface
├── config/
│   ├── supabase.js          # Supabase client configuration
│   └── vapi.js              # VAPI client configuration
├── stores/
│   ├── auth.js              # Authentication state management
│   └── voice.js             # Voice interaction state management
├── views/
│   ├── LoginView.vue        # Login/signup page
│   └── DashboardView.vue    # Main dashboard with voice interface
├── router/
│   └── index.js             # Vue router configuration
├── App.vue                  # Main app component
└── main.js                  # Application entry point
```

## Usage

1. **Sign Up/Login**: Create an account or login with existing credentials
2. **Start Voice Chat**: Click "Start Voice Chat" to begin voice interaction
3. **Voice Conversation**: Speak naturally to the AI assistant
4. **Text Messages**: Send text messages while voice chat is active
5. **End Session**: Click "End Voice Chat" to stop the session

## Technologies Used

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Fast build tool and dev server
- **Supabase** - Backend-as-a-Service for authentication
- **VAPI** - Voice AI platform for real-time conversations
- **Pinia** - State management for Vue
- **Vue Router** - Client-side routing

## Configuration Notes

- The VAPI assistant is configured with GPT-3.5-turbo and PlayHT voice
- Voice settings can be customized in `src/config/vapi.js`
- Authentication flows are handled automatically with route guards
- Real-time voice status indicators show listening/speaking states

## Troubleshooting

- Ensure microphone permissions are granted in your browser
- Check that all environment variables are properly set
- Verify Supabase project settings allow the correct domain
- Make sure VAPI account has sufficient credits for voice interactions

## License

MIT License - feel free to use this project as a starting point for your own applications!