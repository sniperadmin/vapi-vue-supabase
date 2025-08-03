import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize auth state before mounting
const initializeApp = async () => {
  const authStore = useAuthStore()
  
  // Try to restore session on app start
  await authStore.getCurrentUser()
  
  app.mount('#app')
}

initializeApp()