<template>
  <div class="channel-sidebar">
    <div class="server-header">
      <span>{{ serverName }}</span>
      <button class="add-channel-button" @click="showCreateModal = true" title="Create Channel">
        <font-awesome-icon icon="plus" />
      </button>
    </div>
    <div class="channels-container">
      <div v-if="channels.length === 0" class="no-channels">
        <span>No channels available</span>
      </div>
      <div
        v-for="channel in channels"
        :key="channel.id"
        class="channel-item"
        :class="{ active: channel.active }"
        @click="selectChannel(channel)"
      >
        <font-awesome-icon :icon="getChannelIcon(channel)" class="channel-icon" />
        <span class="channel-name">{{ channel.name }}</span>
      </div>
    </div>

    <!-- Create Channel Modal -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Create Channel</h2>
            <button class="modal-close-button" @click="closeModal">
              <font-awesome-icon icon="times" />
            </button>
          </div>
          <form @submit.prevent="handleCreateChannel" class="modal-form">
            <div class="form-group">
              <label for="channelName">Channel Name</label>
              <input
                type="text"
                id="channelName"
                v-model="channelName"
                required
                placeholder="new-channel"
                class="form-input"
              />
            </div>
            <div v-if="createError" class="error-message">
              <font-awesome-icon icon="exclamation-circle" /> {{ createError }}
            </div>
            <div class="modal-actions">
              <button type="button" class="cancel-button" @click="closeModal">Cancel</button>
              <button type="submit" class="create-button" :disabled="isCreating">
                <span v-if="isCreating">
                  <font-awesome-icon icon="spinner" spin /> Creating...
                </span>
                <span v-else><font-awesome-icon icon="plus" /> Create Channel</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createChannel } from '../../api/servers'
import type { Channel } from '../../api/servers'

interface Props {
  serverName?: string
  serverId?: number | null
  channels?: Channel[]
}

const props = withDefaults(defineProps<Props>(), {
  serverName: 'Awesome Devs',
  serverId: null,
  channels: () => [],
})

const showCreateModal = ref(false)
const channelName = ref('')
const isCreating = ref(false)
const createError = ref('')

const emit = defineEmits(['channelSelect', 'channelCreated'])

const selectChannel = (channel: Channel) => {
  emit('channelSelect', channel.id)
  console.log('Selected channel:', channel)
}

const getChannelIcon = (channel: Channel) => {
  return channel.type === 'VOICE' ? 'volume-high' : 'hashtag'
}

const closeModal = () => {
  showCreateModal.value = false
  channelName.value = ''
  createError.value = ''
}

const handleCreateChannel = async () => {
  if (!props.serverId) {
    createError.value = 'No server selected.'
    return
  }

  const name = channelName.value.trim()
  if (!name) {
    createError.value = 'Channel name is required.'
    return
  }

  isCreating.value = true
  createError.value = ''

  try {
    await createChannel(props.serverId, { name, type: 'TEXT' })
    closeModal()
    emit('channelCreated')
  } catch (err: any) {
    createError.value = err?.response?.data?.message || err.message || 'Failed to create channel.'
    console.error('Create channel error:', err)
  } finally {
    isCreating.value = false
  }
}
</script>

<style scoped>
.channel-sidebar {
  width: 240px;
  min-width: 240px;
  background: var(--dc-bg-sidebar);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.server-header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--dc-divider);
  font-weight: 700;
  font-size: 15px;
  color: var(--dc-text-header);
}

.add-channel-button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--dc-text-muted);
  font-size: 16px;
  padding: 4px 8px;
  border-radius: 4px;
  transition:
    background-color 0.1s ease,
    color 0.1s ease;
}

.add-channel-button:hover {
  background: var(--dc-bg-hover);
  color: var(--dc-text-normal);
}

.channels-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 8px 0;
}

.no-channels {
  padding: 16px;
  text-align: center;
  color: var(--dc-text-muted);
  font-size: 14px;
}

.channel-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.1s ease;
  color: var(--dc-text-muted);
}

.channel-item:hover {
  background: var(--dc-bg-hover);
  color: var(--dc-text-normal);
}

.channel-item.active {
  background: var(--dc-bg-hover);
  color: var(--dc-text-normal);
}

.channel-icon {
  font-size: 18px;
  line-height: 1;
}

.channel-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
}
</style>

<!-- Unscoped styles for Teleported modal elements -->
<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: #36393f;
  border-radius: 8px;
  padding: 24px;
  width: 440px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.modal-header h2 {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.modal-close-button {
  background: none;
  border: none;
  color: #b9bbbe;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.1s ease;
}

.modal-close-button:hover {
  color: #fff;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #b9bbbe;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  background: #202225;
  border: 1px solid #202225;
  border-radius: 4px;
  color: #dcddde;
  font-size: 15px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s ease;
}

.form-input:focus {
  border-color: #5865f2;
}

.error-message {
  background: #f04747;
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.cancel-button {
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 500;
  transition: color 0.1s ease;
}

.cancel-button:hover {
  color: #dcddde;
}

.create-button {
  background: #5865f2;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 600;
  transition: background-color 0.15s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.create-button:hover:not(:disabled) {
  background: #4752c4;
}

.create-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
