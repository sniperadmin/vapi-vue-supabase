<template>
  <div class="settings-panel">
    <div class="settings-header">
      <h3>⚙️ Account Settings</h3>
      <p>Manage your account preferences and security settings</p>
    </div>

    <div class="settings-section">
      <div class="section-header">
        <h4>🔐 PIN Code Security</h4>
        <p>Create a 6-digit PIN for additional security</p>
      </div>

      <div class="pin-status">
        <div class="status-indicator" :class="{ active: hasPin }">
          <div class="status-dot"></div>
          <span>{{ hasPin ? 'PIN Active' : 'No PIN Set' }}</span>
        </div>
        <div v-if="hasPin && profileStore.profile?.pin_created_at" class="pin-info">
          Created: {{ formatDate(profileStore.profile.pin_created_at) }}
          <span v-if="profileStore.profile?.pin_updated_at !== profileStore.profile?.pin_created_at">
            | Updated: {{ formatDate(profileStore.profile.pin_updated_at) }}
          </span>
        </div>
      </div>

      <!-- Create PIN Form -->
      <div v-if="!hasPin" class="pin-form">
        <h5>Create New PIN</h5>
        <div class="form-group">
          <label for="new-pin">Enter 6-digit PIN</label>
          <input
            id="new-pin"
            v-model="newPin"
            type="password"
            maxlength="6"
            placeholder="000000"
            class="pin-input"
            @input="validatePinInput"
          />
          <small class="input-hint">Enter exactly 6 digits (0-9)</small>
        </div>
        
        <div class="form-group">
          <label for="confirm-pin">Confirm PIN</label>
          <input
            id="confirm-pin"
            v-model="confirmPin"
            type="password"
            maxlength="6"
            placeholder="000000"
            class="pin-input"
            @input="validatePinInput"
          />
        </div>

        <button
          @click="handleCreatePin"
          :disabled="!canCreatePin || profileStore.loading"
          class="action-btn create-btn"
        >
          {{ profileStore.loading ? 'Creating...' : 'Create PIN' }}
        </button>
      </div>

      <!-- Update PIN Form -->
      <div v-if="hasPin && showUpdateForm" class="pin-form">
        <h5>Update PIN</h5>
        <div class="form-group">
          <label for="current-pin">Current PIN</label>
          <input
            id="current-pin"
            v-model="currentPin"
            type="password"
            maxlength="6"
            placeholder="000000"
            class="pin-input"
          />
        </div>
        
        <div class="form-group">
          <label for="new-pin-update">New PIN</label>
          <input
            id="new-pin-update"
            v-model="newPin"
            type="password"
            maxlength="6"
            placeholder="000000"
            class="pin-input"
            @input="validatePinInput"
          />
        </div>
        
        <div class="form-group">
          <label for="confirm-pin-update">Confirm New PIN</label>
          <input
            id="confirm-pin-update"
            v-model="confirmPin"
            type="password"
            maxlength="6"
            placeholder="000000"
            class="pin-input"
            @input="validatePinInput"
          />
        </div>

        <div class="form-actions">
          <button
            @click="handleUpdatePin"
            :disabled="!canUpdatePin || profileStore.loading"
            class="action-btn update-btn"
          >
            {{ profileStore.loading ? 'Updating...' : 'Update PIN' }}
          </button>
          <button
            @click="cancelUpdate"
            class="action-btn cancel-btn"
          >
            Cancel
          </button>
        </div>
      </div>

      <!-- PIN Actions -->
      <div v-if="hasPin && !showUpdateForm" class="pin-actions">
        <button
          @click="showUpdateForm = true"
          class="action-btn secondary-btn"
        >
          Update PIN
        </button>
        <button
          @click="showDeleteConfirm = true"
          class="action-btn danger-btn"
        >
          Delete PIN
        </button>
      </div>

      <!-- Delete Confirmation -->
      <div v-if="showDeleteConfirm" class="delete-confirm">
        <h5>⚠️ Delete PIN</h5>
        <p>Are you sure you want to delete your PIN? This action cannot be undone.</p>
        
        <div class="form-group">
          <label for="delete-pin">Enter current PIN to confirm</label>
          <input
            id="delete-pin"
            v-model="deletePin"
            type="password"
            maxlength="6"
            placeholder="000000"
            class="pin-input"
          />
        </div>

        <div class="form-actions">
          <button
            @click="handleDeletePin"
            :disabled="!deletePin || deletePin.length !== 6 || profileStore.loading"
            class="action-btn danger-btn"
          >
            {{ profileStore.loading ? 'Deleting...' : 'Confirm Delete' }}
          </button>
          <button
            @click="cancelDelete"
            class="action-btn cancel-btn"
          >
            Cancel
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="profileStore.error" class="error-message">
        {{ profileStore.error }}
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useProfileStore } from '../stores/profile.js'

const profileStore = useProfileStore()

// Form state
const newPin = ref('')
const confirmPin = ref('')
const currentPin = ref('')
const deletePin = ref('')
const showUpdateForm = ref(false)
const showDeleteConfirm = ref(false)
const successMessage = ref('')

// Computed properties
const hasPin = computed(() => !!profileStore.profile?.pin_code)

const canCreatePin = computed(() => {
  return newPin.value.length === 6 && 
         confirmPin.value.length === 6 && 
         newPin.value === confirmPin.value &&
         /^\d{6}$/.test(newPin.value)
})

const canUpdatePin = computed(() => {
  return currentPin.value.length === 6 &&
         newPin.value.length === 6 && 
         confirmPin.value.length === 6 && 
         newPin.value === confirmPin.value &&
         /^\d{6}$/.test(newPin.value) &&
         currentPin.value !== newPin.value
})

// Methods
const validatePinInput = (event) => {
  // Only allow digits
  event.target.value = event.target.value.replace(/\D/g, '')
}

const handleCreatePin = async () => {
  const result = await profileStore.createPin(newPin.value)
  if (result.success) {
    successMessage.value = 'PIN created successfully!'
    resetForms()
    setTimeout(() => { successMessage.value = '' }, 3000)
  }
}

const handleUpdatePin = async () => {
  const result = await profileStore.updatePin(currentPin.value, newPin.value)
  if (result.success) {
    successMessage.value = 'PIN updated successfully!'
    resetForms()
    showUpdateForm.value = false
    setTimeout(() => { successMessage.value = '' }, 3000)
  }
}

const handleDeletePin = async () => {
  const result = await profileStore.deletePin(deletePin.value)
  if (result.success) {
    successMessage.value = 'PIN deleted successfully!'
    resetForms()
    showDeleteConfirm.value = false
    setTimeout(() => { successMessage.value = '' }, 3000)
  }
}

const cancelUpdate = () => {
  showUpdateForm.value = false
  resetForms()
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  deletePin.value = ''
}

const resetForms = () => {
  newPin.value = ''
  confirmPin.value = ''
  currentPin.value = ''
  deletePin.value = ''
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Clear error when user starts typing
watch([newPin, confirmPin, currentPin, deletePin], () => {
  if (profileStore.error) {
    profileStore.error = null
  }
})

// Load profile on mount
onMounted(async () => {
  await profileStore.fetchProfile()
})
</script>

<style scoped>
.settings-panel {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 32px;
  text-align: center;
}

.settings-header h3 {
  color: #333;
  margin: 0 0 8px 0;
  font-size: 24px;
}

.settings-header p {
  color: #6b7280;
  margin: 0;
}

.settings-section {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
}

.section-header {
  margin-bottom: 20px;
}

.section-header h4 {
  color: #374151;
  margin: 0 0 4px 0;
  font-size: 18px;
}

.section-header p {
  color: #6b7280;
  margin: 0;
  font-size: 14px;
}

.pin-status {
  margin-bottom: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
}

.status-indicator.active .status-dot {
  background: #10b981;
}

.pin-info {
  font-size: 12px;
  color: #6b7280;
}

.pin-form {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

.pin-form h5 {
  margin: 0 0 16px 0;
  color: #374151;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.pin-input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 16px;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  text-align: center;
}

.pin-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.input-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.action-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.create-btn {
  background: #10b981;
  color: white;
  width: 100%;
}

.create-btn:hover:not(:disabled) {
  background: #059669;
}

.update-btn {
  background: #3b82f6;
  color: white;
}

.update-btn:hover:not(:disabled) {
  background: #2563eb;
}

.secondary-btn {
  background: #6b7280;
  color: white;
}

.secondary-btn:hover {
  background: #4b5563;
}

.danger-btn {
  background: #ef4444;
  color: white;
}

.danger-btn:hover:not(:disabled) {
  background: #dc2626;
}

.cancel-btn {
  background: #e5e7eb;
  color: #374151;
}

.cancel-btn:hover {
  background: #d1d5db;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pin-actions {
  display: flex;
  gap: 12px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.delete-confirm {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

.delete-confirm h5 {
  margin: 0 0 8px 0;
  color: #dc2626;
}

.delete-confirm p {
  margin: 0 0 16px 0;
  color: #374151;
  font-size: 14px;
}

.error-message {
  color: #dc2626;
  background: #fef2f2;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #fecaca;
  text-align: center;
  margin-top: 16px;
}

.success-message {
  color: #059669;
  background: #ecfdf5;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #a7f3d0;
  text-align: center;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .settings-panel {
    margin: 16px;
    padding: 16px;
  }
  
  .pin-actions {
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>