<template>
  <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Add a Server</h2>
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
        <p class="modal-description">
          How would you like to add a server? You can create a new one or join an existing server.
        </p>

        <div class="action-buttons">
          <button class="action-button primary" @click="handleCreateServer">
            <div class="button-content">
              <svg class="button-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5V19M5 12H19"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>Create My Own</span>
            </div>
          </button>

          <button class="action-button secondary" @click="handleJoinServer">
            <div class="button-content">
              <svg class="button-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>Join a Server</span>
            </div>
          </button>
        </div>
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
  (e: 'createServer'): void
  (e: 'joinServer'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
})

const emit = defineEmits<Emits>()

const isVisible = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue
  },
)

const handleClose = () => {
  isVisible.value = false
  emit('update:modelValue', false)
}

const handleOverlayClick = () => {
  handleClose()
}

const handleCreateServer = () => {
  emit('createServer')
  handleClose()
}

const handleJoinServer = () => {
  emit('joinServer')
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
  max-width: 440px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.2s ease;
  border: 1px solid var(--dc-divider);
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
}

.modal-description {
  color: var(--dc-text-muted);
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 24px;
  text-align: center;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-button {
  background: none;
  border: 1px solid var(--dc-divider);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  width: 100%;
}

.action-button:hover {
  border-color: var(--dc-accent);
  background: rgba(88, 101, 242, 0.06);
}

.action-button.primary {
  background: var(--dc-accent);
  border-color: var(--dc-accent);
  color: white;
}

.action-button.primary:hover {
  background: var(--dc-accent-hover);
  border-color: var(--dc-accent-hover);
}

.action-button.secondary {
  color: var(--dc-text-header);
}

.button-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.button-icon {
  flex-shrink: 0;
}

.button-content span {
  font-size: 16px;
  font-weight: 600;
}
</style>
