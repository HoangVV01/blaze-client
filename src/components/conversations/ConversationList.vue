<template>
  <div class="conversation-list">
    <div class="list-header">
      <h2>Direct Messages</h2>
      <button class="add-button" title="New Message" @click="showSearchModal = true">+</button>
    </div>
    <div class="conversations">
      <ConversationItem
        v-for="conversation in conversations"
        :key="conversation.id"
        :conversation="conversation"
        :isActive="activeConversationId === conversation.id"
        @click="handleConversationClick"
      />
    </div>
    <!-- Popup Modal for Searching People -->
    <div v-if="showSearchModal" class="modal-overlay" @click.self="showSearchModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <span>Search for a person</span>
          <button class="modal-close" @click="showSearchModal = false">&times;</button>
        </div>
        <input
          v-model="searchQuery"
          class="modal-search-input"
          type="text"
          placeholder="Search for a person..."
          autofocus
        />
        <div v-if="searching" class="modal-search-status">Searching...</div>
        <div v-else-if="searchError" class="modal-search-status error">{{ searchError }}</div>
        <ul v-if="searchResults.length" class="modal-search-results">
          <li
            v-for="user in searchResults"
            :key="user.id"
            class="modal-search-result"
            @click="() => handleUserSelect(user)"
          >
            <span class="result-avatar" :style="{ background: user.color }">{{
              user.initials
            }}</span>
            <span class="result-username">{{ user.username }}</span>
            <span class="result-email">{{ user.email }}</span>
          </li>
        </ul>
        <div v-else-if="searchQuery && !searching && !searchError" class="modal-search-status">
          No users found.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import ConversationItem from './ConversationItem.vue'
import Avatar from '../shared/Avatar.vue'
import { searchUsers, type UserSearchResult } from '../../api/users'
import { createDirectConversation, getMyConversations } from '../../api/conversations'
import { getCurrentUserId } from '../../api/auth'

import type { Conversation } from '../../types/conversation'

// Get current user data from localStorage
const getUserData = (): {
  username: string
  email: string
  initials: string
  status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY'
} => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      return {
        username: user.username || 'User',
        email: user.email || 'user@example.com',
        initials: user.username
          ? user.username
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
          : 'U',
        status: 'ONLINE',
      }
    } catch (error) {
      console.error('Failed to parse user data:', error)
    }
  }
  return {
    username: 'User',
    email: 'user@example.com',
    initials: 'U',
    status: 'ONLINE',
  }
}

const currentUser = ref<{
  username: string
  email: string
  initials: string
  status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY'
}>(getUserData())

const props = defineProps<{
  activeConversationId: number | null
  conversations: Conversation[]
}>()

const emit = defineEmits(['update:activeConversationId'])

const handleConversationClick = (conversation: Conversation) => {
  emit('update:activeConversationId', conversation.id)
}

// Modal state
const showSearchModal = ref(false)
const searchQuery = ref('')
const searchResults = ref<UserSearchResult[]>([])
const searching = ref(false)
const searchError = ref('')

// Handle selecting a user from search
const handleUserSelect = async (user: UserSearchResult) => {
  try {
    const conversation = await createDirectConversation(user.id)
    // Optionally, refresh the conversation list
    const userId = getCurrentUserId()
    if (userId) {
      const updatedConversations = await getMyConversations()
      emit('update:activeConversationId', conversation.id)
      // Optionally, emit an event or use a global store to update conversations in parent
      // For now, close modal
      showSearchModal.value = false
    }
  } catch (e: any) {
    searchError.value = e?.message || 'Failed to start conversation'
  }
}

// Simple debounce implementation
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}

const doUserSearch = debounce(async (q: string) => {
  if (!q) {
    searchResults.value = []
    searchError.value = ''
    searching.value = false
    return
  }
  searching.value = true
  searchError.value = ''
  try {
    searchResults.value = await searchUsers(q)
  } catch (e: any) {
    searchResults.value = []
    searchError.value = e?.message || 'Search failed'
  } finally {
    searching.value = false
  }
}, 400)

watch(searchQuery, (q) => {
  doUserSearch(q)
})
</script>

<style scoped>
.conversation-list {
  width: 240px;
  min-width: 240px;
  background: var(--dc-bg-sidebar);
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid var(--dc-divider);
}

.list-header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--dc-divider);
}

.list-header h2 {
  font-size: 16px;
  font-weight: 700;
  color: var(--dc-text-header);
  margin: 0;
}

.add-button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--dc-text-muted);
  font-size: 20px;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-button:hover {
  background: var(--dc-bg-hover);
  color: var(--dc-text-normal);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--dc-bg-tertiary, #232428);
  border-radius: 10px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.25);
  padding: 24px 24px 16px 24px;
  min-width: 320px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 700;
  color: var(--dc-text-header);
  margin-bottom: 8px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--dc-text-muted);
  cursor: pointer;
  padding: 0 4px;
  border-radius: 4px;
  transition: background 0.1s;
}
.modal-close:hover {
  background: var(--dc-bg-hover);
  color: var(--dc-text-normal);
}

.modal-search-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: none;
  background: var(--dc-bg-secondary, #2f3136);
  color: var(--dc-text-normal);
  font-size: 15px;
  outline: none;
  margin-bottom: 8px;
}

.modal-search-status {
  color: var(--dc-text-muted);
  font-size: 14px;
  margin: 8px 0 0 0;
}
.modal-search-status.error {
  color: #e06c75;
}

.modal-search-results {
  list-style: none;
  margin: 12px 0 0 0;
  padding: 0;
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-search-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  background: var(--dc-bg-secondary, #292b30);
  transition: background 0.12s;
}
.modal-search-result:hover {
  background: var(--dc-bg-hover, #36393f);
}

.conversations {
  flex: 1;
  overflow-y: auto;
}

.result-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  flex-shrink: 0;
}

.user-profile {
  height: 52px;
  background: #232428;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid var(--dc-divider);
  flex-shrink: 0;
}

.user-avatar {
  position: relative;
  cursor: pointer;
}

.user-info {
  flex: 1;
  overflow: hidden;
}

.username {
  font-size: 13px;
  font-weight: 600;
  color: var(--dc-text-header);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 11px;
  color: var(--dc-text-muted);
}

.user-controls {
  display: flex;
  gap: 4px;
}

.control-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: var(--dc-text-muted);
  font-size: 16px;
  transition: background-color 0.1s ease;
}

.control-button:hover {
  background: var(--dc-bg-hover);
}
</style>
