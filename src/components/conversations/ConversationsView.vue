<template>
  <div class="conversations-view">
    <ConversationList
      v-model:activeConversationId="activeConversationId"
      :conversations="conversations"
    />
    <ConversationDetail
      :activeConversationId="activeConversationId"
      :conversations="conversations"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ConversationList from './ConversationList.vue'
import ConversationDetail from './ConversationDetail.vue'
import { getMyConversations } from '../../api/conversations'
import { getCurrentUserId } from '../../api/auth'
import type { Conversation } from '../../types/conversation'

const conversations = ref<Conversation[]>([])
const activeConversationId = ref<number | null>(null)

onMounted(async () => {
  try {
    conversations.value = await getMyConversations()
    if (conversations.value.length > 0 && conversations.value[0]) {
      activeConversationId.value = conversations.value[0].id
    }
  } catch (error) {
    console.error('Failed to load conversations:', error)
    conversations.value = []
  }
})
</script>

<style scoped>
.conversations-view {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--dc-bg-tertiary);
}
</style>
