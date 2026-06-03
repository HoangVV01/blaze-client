<template>
  <div class="conversation-item" :class="{ active: isActive }" @click="handleClick">
    <div class="conversation-avatar">
      <Avatar
        :initials="conversation.initials"
        :size="48"
        :backgroundColor="conversation.color"
        :status="conversation.status"
      />
    </div>
    <div class="conversation-info">
      <div class="conversation-header">
        <span class="conversation-name">{{ conversation.name }}</span>
        <span class="conversation-timestamp">{{ conversation.timestamp }}</span>
      </div>
      <div class="conversation-preview">
        <span v-if="conversation.unread" class="unread-indicator"></span>
        <span class="preview-text">{{ conversation.lastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Avatar from '../shared/Avatar.vue'
import type { Conversation } from '../../types/conversation'

interface Props {
  conversation: Conversation
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
})

const emit = defineEmits<{
  click: [conversation: Conversation]
}>()

const handleClick = () => {
  emit('click', props.conversation)
}
</script>

<style scoped>
.conversation-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.1s ease;
  border-bottom: 1px solid var(--dc-divider);
}

.conversation-item:hover {
  background: var(--dc-bg-hover);
}

.conversation-item.active {
  background: var(--dc-bg-hover);
}

.conversation-avatar {
  flex-shrink: 0;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.conversation-name {
  font-weight: 600;
  font-size: 15px;
  color: var(--dc-text-header);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-timestamp {
  font-size: 12px;
  color: var(--dc-text-muted);
  flex-shrink: 0;
}

.conversation-preview {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background: var(--dc-accent);
  border-radius: 50%;
  flex-shrink: 0;
}

.preview-text {
  font-size: 14px;
  color: var(--dc-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
</style>
