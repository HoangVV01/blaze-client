<template>
  <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Customize Your Server</h2>
        <button class="close-button" @click="handleClose">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Server Name</label>
          <input
            v-model="serverName"
            type="text"
            class="form-input"
            placeholder="Enter server name"
            maxlength="100"
            @keyup.enter="handleCreate"
          />
          <p class="form-hint">This is your server's name - you can change it later.</p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="handleClose">Cancel</button>
        <button class="btn-primary" :disabled="!serverName.trim()" @click="handleCreate">
          Create Server
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'createServer', serverData: { name: string }): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
})

const emit = defineEmits<Emits>()

const isVisible = ref(props.modelValue)
const serverName = ref('')

watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue
    if (newValue) {
      // Reset form when modal opens
      serverName.value = ''
    }
  },
)

const handleClose = () => {
  isVisible.value = false
  emit('update:modelValue', false)
}

const handleOverlayClick = () => {
  handleClose()
}

const handleCreate = () => {
  if (!serverName.value.trim()) {
    return
  }

  emit('createServer', {
    name: serverName.value.trim(),
  })

  handleClose()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: var(--dc-bg-primary);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.2s ease;
  border: 1px solid var(--dc-divider);
  display: flex;
  flex-direction: column;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 24px 24px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--dc-divider);
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--dc-text-header);
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: var(--dc-text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition:
    background 0.1s,
    color 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--dc-text-normal);
}

.modal-body {
  padding: 24px;
  flex: 1;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--dc-text-header);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  background: var(--dc-bg-tertiary);
  border: 1px solid var(--dc-divider);
  border-radius: 8px;
  color: var(--dc-text-normal);
  font-size: 15px;
  font-family: inherit;
  transition: border-color 0.15s;
}

.form-input:focus {
  outline: none;
  border-color: var(--dc-accent);
  box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1);
}

.form-input::placeholder {
  color: var(--dc-text-muted);
}

.form-hint {
  font-size: 12px;
  color: var(--dc-text-muted);
  margin-top: 6px;
  line-height: 1.4;
}

.modal-footer {
  padding: 16px 24px 24px;
  border-top: 1px solid var(--dc-divider);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-secondary,
.btn-primary {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.btn-secondary {
  background: var(--dc-bg-tertiary);
  color: var(--dc-text-header);
}

.btn-secondary:hover {
  background: var(--dc-bg-sidebar);
}

.btn-primary {
  background: var(--dc-accent);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--dc-accent-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
