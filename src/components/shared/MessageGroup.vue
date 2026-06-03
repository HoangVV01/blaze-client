<template>
  <div class="message-group" :class="{ 'own-message': isOwnMessage }">
    <div v-if="!isOwnMessage" class="message-avatar">
      <Avatar :initials="getInitials(message.senderName)" :size="40" :backgroundColor="'#5865f2'" />
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="author-name">{{ message.senderName }}</span>
        <span class="message-timestamp">{{ formatTimestamp(message.createdAt) }}</span>
      </div>

      <!-- Text message -->
      <div v-if="message.messageType === MessageType.TEXT" class="message-text">
        {{ message.content }}
      </div>

      <!-- Image message -->
      <div v-else-if="message.messageType === MessageType.IMAGE" class="message-media">
        <img v-if="message.mediaUrl" :src="message.mediaUrl" alt="Image" class="message-image" />
        <div v-if="message.content" class="message-text">{{ message.content }}</div>
      </div>

      <!-- Video message -->
      <div v-else-if="message.messageType === MessageType.VIDEO" class="message-media">
        <video
          v-if="message.mediaUrl"
          :src="message.mediaUrl"
          controls
          class="message-video"
        ></video>
        <div v-if="message.content" class="message-text">{{ message.content }}</div>
      </div>

      <!-- File message -->
      <div v-else-if="message.messageType === MessageType.FILE" class="message-media">
        <div class="file-attachment">
          <font-awesome-icon icon="file" />
          <span class="file-name">{{ message.fileName || 'Unknown file' }}</span>
          <span v-if="message.fileSize" class="file-size"
            >({{ formatFileSize(message.fileSize) }})</span
          >
        </div>
        <div v-if="message.content" class="message-text">{{ message.content }}</div>
      </div>

      <!-- Audio message -->
      <div v-else-if="message.messageType === MessageType.AUDIO" class="message-media">
        <audio
          v-if="message.mediaUrl"
          :src="message.mediaUrl"
          controls
          class="message-audio"
        ></audio>
        <div v-if="message.content" class="message-text">{{ message.content }}</div>
      </div>

      <!-- System messages (join, leave, etc.) -->
      <div
        v-else-if="
          message.messageType === MessageType.SYSTEM ||
          message.messageType === MessageType.JOIN ||
          message.messageType === MessageType.LEAVE
        "
        class="system-message"
      >
        {{ message.content }}
      </div>

      <!-- Media display for backward compatibility -->
      <div
        v-if="
          message.mediaUrl &&
          !['TEXT', 'IMAGE', 'VIDEO', 'FILE', 'AUDIO'].includes(message.messageType)
        "
        class="message-media"
      >
        <img v-if="message.mediaType?.startsWith('image/')" :src="message.mediaUrl" alt="Media" />
        <div v-else class="file-attachment">
          <font-awesome-icon icon="file" /> {{ message.fileName }}
        </div>
      </div>

      <!-- Edited indicator -->
      <div v-if="message.isEdited" class="edited-indicator">(edited)</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Avatar from './Avatar.vue'
import { MessageType } from '../../api/messages'
import { getCurrentUserId } from '../../api/auth'
import type { MessageDTO } from '../../api/messages'

interface Props {
  message: MessageDTO
}

const props = defineProps<Props>()

const isOwnMessage = computed(() => {
  const currentUserId = getCurrentUserId()
  return currentUserId && props.message.senderId.toString() === currentUserId.toString()
})

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatTimestamp(timestamp?: string): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}
</script>

<style scoped>
.message-group {
  padding: 4px 16px 4px;
  display: flex;
  gap: 16px;
  position: relative;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
}

.author-name {
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
}

.author-name:hover {
  text-decoration: underline;
}

.message-timestamp {
  font-size: 11px;
  color: var(--dc-text-muted);
}

.message-text {
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 15px;
  line-height: 1.5;
  color: var(--dc-text-normal);
}

.message-reactions {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.reaction {
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 13px;
  cursor: pointer;
  color: var(--dc-text-normal);
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid transparent;
  transition: all 0.1s ease;
}

.reaction:hover {
  background: rgba(88, 101, 242, 0.3);
  border-color: rgba(88, 101, 242, 0.5);
}

.reaction-count {
  font-size: 12px;
}

.message-media {
  margin-top: 4px;
}

.message-image {
  max-width: 300px;
  max-height: 300px;
  border-radius: 8px;
  object-fit: cover;
}

.message-video {
  max-width: 400px;
  max-height: 300px;
  border-radius: 8px;
}

.message-audio {
  margin-top: 4px;
}

.file-attachment {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 8px;
  width: fit-content;
  cursor: pointer;
  transition: background 0.1s;
}

.file-attachment:hover {
  background: rgba(255, 255, 255, 0.1);
}

.file-name {
  font-size: 14px;
  color: var(--dc-text-normal);
}

.file-size {
  font-size: 12px;
  color: var(--dc-text-muted);
}

.system-message {
  font-size: 12px;
  color: var(--dc-text-muted);
  font-style: italic;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
  width: fit-content;
}

.edited-indicator {
  font-size: 11px;
  color: var(--dc-text-muted);
  margin-left: 4px;
  display: inline-block;
}

/* Own message styling */
.own-message {
  flex-direction: row-reverse;
}

.own-message .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.own-message .message-header {
  justify-content: flex-end;
}

.own-message .message-text {
  background: rgba(88, 101, 242, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  margin-top: 4px;
}

.own-message .message-media {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.own-message .file-attachment {
  background: rgba(88, 101, 242, 0.2);
}

.own-message .system-message {
  align-self: center;
}
</style>
