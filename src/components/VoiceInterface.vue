<template>
  <div class="voice-interface">
    <div class="voice-header">
      <h3>Voice Assistant</h3>
      <div class="connection-status" :class="{ connected: voiceStore.isConnected }">
        {{ voiceStore.isConnected ? 'Connected' : 'Disconnected' }}
      </div>
    </div>

    <div class="voice-controls">
      <button
        v-if="!voiceStore.isConnected"
        @click="startVoiceCall"
        class="voice-btn start-btn"
        :disabled="voiceStore.loading"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
        Start Voice Chat
      </button>

      <button
        v-if="voiceStore.isConnected"
        @click="endVoiceCall"
        class="voice-btn end-btn"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
        End Voice Chat
      </button>
    </div>

    <div v-if="voiceStore.isConnected" class="voice-status">
      <div class="status-indicator">
        <div class="status-item" :class="{ active: voiceStore.isListening }">
          <div class="status-dot"></div>
          <span>Listening</span>
        </div>
      </div>
    </div>

    <div v-if="voiceStore.transcript" class="transcript">
      <h4>Last Transcript:</h4>
      <p>{{ voiceStore.transcript }}</p>
    </div>

    <div v-if="voiceStore.messages.length > 0" class="messages">
      <h4>Conversation:</h4>
      <div class="message-list">
        <div
          v-for="(message, index) in voiceStore.messages"
          :key="index"
          class="message"
          :class="[message.role, { 'function-message': isFunctionMessage(message.role) }]"
        >
          <div class="message-content">
            <strong>{{ getMessageLabel(message.role) }}:</strong>
            {{ message.content }}
          </div>
          <div class="message-time">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
      </div>
    </div>

    <div class="text-input-section">
      <h4>Send Text Message:</h4>
      <div class="text-input-group">
        <input
          v-model="textMessage"
          @keyup.enter="sendTextMessage"
          type="text"
          placeholder="Type a message..."
          class="text-input"
          :disabled="!voiceStore.isConnected"
        />
        <button
          @click="sendTextMessage"
          :disabled="!voiceStore.isConnected || !textMessage.trim()"
          class="send-btn"
        >
          Send
        </button>
      </div>
    </div>

    <div v-if="voiceStore.error" class="error-message">
      {{ voiceStore.error }}
    </div>
    
    <div v-if="!hasValidVapiConfig" class="config-notice">
      <strong>⚠️ VAPI Configuration Required</strong><br>
      Please set up your VAPI credentials in the .env file to enable voice interactions.
      See README.md for setup instructions.
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useVoiceStore } from '../stores/voice.js'
import { hasValidVapiConfig } from '../config/vapi.js'

const voiceStore = useVoiceStore()
const textMessage = ref('')

const startVoiceCall = async () => {
  await voiceStore.startCall()
}

const endVoiceCall = async () => {
  await voiceStore.endCall()
}

const sendTextMessage = async () => {
  if (textMessage.value.trim()) {
    await voiceStore.sendMessage(textMessage.value.trim())
    textMessage.value = ''
  }
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

const isFunctionMessage = (role) => {
  return ['function', 'function-result', 'system'].includes(role)
}

const getMessageLabel = (role) => {
  switch (role) {
    case 'user':
      return 'You'
    case 'assistant':
      return 'Assistant'
    case 'system':
      return 'System'
    default:
      return role.charAt(0).toUpperCase() + role.slice(1)
  }
}
</script>

<style scoped>
.voice-interface {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
}

.voice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e1e5e9;
}

.voice-header h3 {
  color: #333;
  margin: 0;
}

.connection-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  background: #fef2f2;
  color: #dc2626;
}

.connection-status.connected {
  background: #f0fdf4;
  color: #16a34a;
}

.voice-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.voice-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.start-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
}

.end-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.end-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
}

.voice-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.voice-status {
  margin-bottom: 24px;
}

.status-indicator {
  display: flex;
  justify-content: center;
  gap: 32px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  background: #f8fafc;
  transition: all 0.2s;
}

.status-item.active {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
  transition: all 0.2s;
}

.status-item.active .status-dot {
  background: #1d4ed8;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.transcript {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.transcript h4 {
  margin: 0 0 8px 0;
  color: #374151;
}

.transcript p {
  margin: 0;
  color: #6b7280;
  font-style: italic;
}

.messages {
  margin-bottom: 24px;
}

.messages h4 {
  margin: 0 0 16px 0;
  color: #374151;
}

.message-list {
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
}

.message.user {
  background: #dbeafe;
  margin-left: 20px;
}

.message.assistant {
  background: #f0fdf4;
  margin-right: 20px;
}

.message.function-message {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  margin: 0 10px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.message.function {
  background: #dbeafe;
  border-left: 4px solid #3b82f6;
}

.message.function-result {
  background: #ecfdf5;
  border-left: 4px solid #10b981;
}

.message.system {
  background: #f3f4f6;
  border-left: 4px solid #6b7280;
}

.message-content {
  margin-bottom: 4px;
}

.message-time {
  font-size: 12px;
  color: #6b7280;
}

.text-input-section {
  margin-bottom: 16px;
}

.text-input-section h4 {
  margin: 0 0 12px 0;
  color: #374151;
}

.text-input-group {
  display: flex;
  gap: 8px;
}

.text-input {
  flex: 1;
  padding: 10px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
}

.text-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.text-input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.send-btn {
  padding: 10px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #2563eb;
}

.send-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.error-message {
  color: #dc2626;
  background: #fef2f2;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #fecaca;
  text-align: center;
}

.config-notice {
  color: #d97706;
  background: #fef3c7;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #fbbf24;
  text-align: center;
  font-size: 14px;
  line-height: 1.4;
  margin-top: 16px;
}
</style>