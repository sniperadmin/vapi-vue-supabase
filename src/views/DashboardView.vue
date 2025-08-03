<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="user-info">
          <h1>Welcome back! 👋</h1>
          <p v-if="authStore.user">{{ authStore.user.email }}</p>
        </div>
        <div class="header-actions">
          <button @click="showSettings = !showSettings" class="settings-btn">
            ⚙️ Settings
          </button>
          <button @click="handleSignOut" class="sign-out-btn">
            Sign Out
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="dashboard-main">
      <!-- Settings Panel -->
      <section v-if="showSettings" class="settings-section">
        <SettingsPanel />
      </section>

      <!-- Voice Interface Section -->
      <section class="voice-section" :class="{ 'settings-open': showSettings }">
        <VoiceInterface />
      </section>

      <!-- Features Section -->
      <section v-if="!showSettings" class="features-section">
        <h2>🚀 Features</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎤</div>
            <h3>Voice AI Assistant</h3>
            <p>Interact with GPT-3.5-turbo using natural voice commands</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔐</div>
            <h3>Secure Authentication</h3>
            <p>Protected by Supabase authentication system</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Real-time Responses</h3>
            <p>Get instant AI responses with VAPI integration</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Modern Interface</h3>
            <p>Beautiful, responsive design that works everywhere</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔢</div>
            <h3>PIN Security</h3>
            <p>Create and manage 6-digit PIN codes for additional security</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⚙️</div>
            <h3>Account Settings</h3>
            <p>Manage your profile and security preferences</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useProfileStore } from '../stores/profile.js'
import VoiceInterface from '../components/VoiceInterface.vue'
import SettingsPanel from '../components/SettingsPanel.vue'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const router = useRouter()
const showSettings = ref(false)

onMounted(async () => {
  await authStore.getCurrentUser()
  if (!authStore.user) {
    router.push('/')
    return
  }
  
  // Initialize profile store when user is authenticated
  // This ensures PIN verification works even when settings panel isn't open
  await profileStore.fetchProfile()
})

const handleSignOut = async () => {
  await authStore.signOut()
  router.push('/')
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.dashboard-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info h1 {
  color: white;
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
}

.user-info p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.settings-btn,
.sign-out-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.settings-btn:hover,
.sign-out-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.dashboard-main {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.settings-section {
  margin-bottom: 32px;
}

.voice-section {
  margin-bottom: 40px;
  transition: all 0.3s ease;
}

.voice-section.settings-open {
  margin-bottom: 24px;
}

.features-section {
  color: white;
}

.features-section h2 {
  text-align: center;
  font-size: 28px;
  margin: 0 0 32px 0;
  font-weight: 600;
  color: white;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-card h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.feature-card p {
  margin: 0;
  opacity: 0.8;
  line-height: 1.5;
  color: white;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }
  
  .settings-btn,
  .sign-out-btn {
    width: 100%;
    max-width: 200px;
  }
  
  .dashboard-main {
    padding: 16px;
  }
  
  .features-section h2 {
    font-size: 24px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .feature-card {
    padding: 20px;
  }
}
</style>