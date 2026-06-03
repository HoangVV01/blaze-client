<template>
  <div class="conversation-detail">
    <template v-if="displayConversation">
      <div class="detail-header">
        <div class="contact-info">
          <div class="contact-avatar">
            <Avatar
              :initials="displayConversation.initials"
              :size="32"
              :backgroundColor="displayConversation.color"
              :status="displayConversation.status"
            />
          </div>
          <div class="contact-details">
            <div class="contact-name">{{ displayConversation.name }}</div>
            <div class="contact-status">
              {{
                displayConversation.status.charAt(0).toUpperCase() +
                displayConversation.status.slice(1)
              }}
            </div>
          </div>
        </div>
        <div class="header-controls">
          <button class="control-button" title="Call">
            <font-awesome-icon icon="phone" />
          </button>
          <button class="control-button" title="Video Call">
            <font-awesome-icon icon="video" />
          </button>
          <button class="control-button" title="Search">
            <font-awesome-icon icon="magnifying-glass" />
          </button>
          <button class="control-button" title="Inbox">
            <font-awesome-icon icon="inbox" />
          </button>
          <button class="control-button" title="More">
            <font-awesome-icon icon="ellipsis" />
          </button>
        </div>
      </div>
      <div class="detail-messages" ref="chatMessagesContainer">
        <MessageGroup v-for="message in messages" :key="message.id" :message="message" />
        <div v-if="typingUsers.size > 0" class="typing-indicator">
          <em>{{ Array.from(typingUsers).join(', ') }} is typing...</em>
        </div>
        <div class="message-spacing"></div>
      </div>
      <div class="detail-input-container">
        <div class="detail-input-wrapper">
          <button class="input-button" title="Attach File">
            <font-awesome-icon icon="paperclip" />
          </button>
          <textarea
            ref="inputArea"
            class="detail-input"
            :placeholder="`Message ${displayConversation.name}`"
            rows="1"
            v-model="chatInput"
            @keydown.enter.exact.prevent="handleSendMessage"
            @input="handleInput"
          ></textarea>
          <div class="input-controls">
            <button class="control-button" title="GIF">
              <font-awesome-icon icon="image" />
            </button>
            <button class="control-button" title="Emoji">
              <font-awesome-icon icon="face-smile" />
            </button>
          </div>
        </div>
        <div class="input-hint">
          <span class="hint-key">Enter</span> to send
          <span class="hint-separator">•</span>
          <span class="hint-key">Shift + Enter</span> for new line
        </div>
      </div>
    </template>
    <template v-else>
      <div class="empty-detail">
        <div class="empty-icon">💬</div>
        <div class="empty-title">No conversation selected</div>
        <div class="empty-desc">Select a direct message to view details.</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onUnmounted } from 'vue'
import Avatar from '../shared/Avatar.vue'
import MessageGroup from '../shared/MessageGroup.vue'

import { getMessages, sendMessage, MessageType } from '../../api/messages'
import type { MessageDTO, SendMessageRequest } from '../../api/messages'
import type { Conversation } from '../../types/conversation'
import {
  connectWebSocket,
  subscribeToConversation,
  unsubscribeFromConversation,
  subscribeToTyping,
  unsubscribeFromTyping,
  onClose,
  offClose,
  onError,
  offError,
  isWebSocketConnected,
  sendWebSocketMessage,
  sendTypingIndicator,
} from '../../api/websocket'
import type { TypingIndicator } from '../../api/websocket'

const props = defineProps<{
  activeConversationId: number | null
  conversations: Conversation[]
}>()

const activeConversation = computed(() => {
  return props.conversations.find((c) => c.id === props.activeConversationId) || null
})

// Derive display fields for Avatar and status (fallbacks for missing data)
const displayConversation = computed(() => {
  if (!activeConversation.value) return null
  const c = activeConversation.value
  return {
    ...c,
    initials: c.name
      ? c.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'U',
    color: '#5865f2', // You can replace with a color generator if needed
    status: 'online' as const, // Replace with real status if available
  }
})

const messages = ref<MessageDTO[]>([])
const chatInput = ref('')
const inputArea = ref<HTMLTextAreaElement | null>(null)
const chatMessagesContainer = ref<HTMLDivElement | null>(null)
const typingUsers = ref<Set<string>>(new Set())
let typingTimeout: NodeJS.Timeout | null = null

// Function to scroll to bottom of chat messages
const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessagesContainer.value) {
      chatMessagesContainer.value.scrollTop = chatMessagesContainer.value.scrollHeight
    }
  })
}

// Connect to WebSocket on mount
onMounted(async () => {
  try {
    await connectWebSocket()
    setupWebSocketListener()

    // Add connection listeners for reliability
    const connectionListenerId = 'conversation-detail-connection'
    onClose(connectionListenerId, async () => {
      console.log('WebSocket closed, attempting to reconnect...')
      setTimeout(async () => {
        try {
          await connectWebSocket()
          setupWebSocketListener()
        } catch (error) {
          console.error('Reconnect failed:', error)
        }
      }, 3000)
    })

    onError(connectionListenerId, (error) => {
      console.error('WebSocket error:', error)
    })

    // Scroll to bottom on mount
    scrollToBottom()
  } catch (error) {
    console.error('Failed to connect to WebSocket:', error)
    // Retry connection
    setTimeout(async () => {
      try {
        await connectWebSocket()
        setupWebSocketListener()
      } catch (retryError) {
        console.error('Retry failed:', retryError)
      }
    }, 3000)
  }
})

// Setup WebSocket listener
const setupWebSocketListener = () => {
  if (props.activeConversationId) {
    const listenerId = `conversation-${props.activeConversationId}`
    subscribeToConversation(props.activeConversationId, listenerId, (message: MessageDTO) => {
      console.log('Message listener triggered:', message) // Debug log
      if (!messages.value.some((m) => m.id === message.id)) {
        messages.value.push(message)
        scrollToBottom()
      }
    })

    subscribeToTyping(props.activeConversationId, listenerId, (indicator: TypingIndicator) => {
      console.log('Typing listener triggered:', indicator) // Debug log
      if (indicator.isTyping) {
        typingUsers.value.add(indicator.userName)
        if (typingTimeout) {
          clearTimeout(typingTimeout)
        }
        // Clear typing indicator after 3 seconds of inactivity
        typingTimeout = setTimeout(() => {
          typingUsers.value.clear()
        }, 3000)
      } else {
        typingUsers.value.delete(indicator.userName)
      }
    })
  }
}

// Remove listener on unmount
onUnmounted(() => {
  const listenerId = `conversation-${props.activeConversationId}`
  unsubscribeFromConversation(listenerId)
  unsubscribeFromTyping(listenerId)
  offClose('conversation-detail-connection')
  offError('conversation-detail-connection')
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
})

watch(
  () => props.activeConversationId,
  async (newId, oldId) => {
    // Remove old listener
    if (oldId) {
      const oldListenerId = `conversation-${oldId}`
      unsubscribeFromConversation(oldListenerId)
      unsubscribeFromTyping(oldListenerId)
    }
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    if (newId) {
      messages.value = await getMessages(newId)
      typingUsers.value.clear()
      // Setup new listener for the new conversation
      const newListenerId = `conversation-${newId}`
      subscribeToConversation(newId, newListenerId, (message: MessageDTO) => {
        if (!messages.value.some((m) => m.id === message.id)) {
          messages.value.push(message)
          scrollToBottom()
        }
      })
      subscribeToTyping(newId, newListenerId, (indicator: TypingIndicator) => {
        if (indicator.isTyping) {
          typingUsers.value.add(indicator.userName)
          if (typingTimeout) {
            clearTimeout(typingTimeout)
          }
          typingTimeout = setTimeout(() => {
            typingUsers.value.clear()
          }, 3000)
        } else {
          typingUsers.value.delete(indicator.userName)
        }
      })
      // Scroll to bottom when conversation changes
      scrollToBottom()
    } else {
      messages.value = []
      typingUsers.value.clear()
    }
  },
  { immediate: true },
)

async function handleSendMessage() {
  const text = chatInput.value.trim()
  if (!text || !props.activeConversationId) return

  try {
    const request: SendMessageRequest = {
      conversationId: props.activeConversationId,
      content: text,
      messageType: MessageType.TEXT,
    }

    // Send message via WebSocket
    sendWebSocketMessage(props.activeConversationId, request)

    // The following lines are commented out to prevent duplicate inserts:
    // const newMessage = await sendMessage(request)
    // messages.value.push(newMessage)

    chatInput.value = ''
    if (inputArea.value) inputArea.value.style.height = 'auto'
    nextTick(() => autoResize())
    // Scroll to bottom after sending message
    scrollToBottom()
  } catch (error) {
    console.error('Error sending message:', error)
    // You could show an error toast notification here
  }
}

// Handle input events (both auto resize and typing indicator)
function handleInput() {
  autoResize()
  if (chatInput.value.trim().length > 0 && props.activeConversationId) {
    sendTypingIndicator(props.activeConversationId, true)
  }
}

function autoResize() {
  const el = inputArea.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 200) + 'px'
}
</script>

<style scoped>
.conversation-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--dc-bg-tertiary);
  min-width: 0;
}

.detail-header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--dc-divider);
  flex-shrink: 0;
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.contact-avatar {
  flex-shrink: 0;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-name {
  font-weight: 700;
  font-size: 15px;
  color: var(--dc-text-header);
}

.contact-status {
  font-size: 11px;
  color: var(--dc-text-muted);
}

.header-controls {
  display: flex;
  gap: 4px;
}

.control-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
  color: var(--dc-text-muted);
  font-size: 16px;
  transition: background 0.1s;
}

.control-button:hover {
  background: var(--dc-bg-hover);
}

.detail-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.typing-indicator {
  color: var(--dc-text-muted);
  font-size: 13px;
  padding: 8px 16px;
  font-style: italic;
}

.message-spacing {
  height: 32px;
}

.detail-input-container {
  padding: 0 16px 24px;
  flex-shrink: 0;
}

.detail-input-wrapper {
  background: #383a40;
  border-radius: 8px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 0 4px 0 16px;
}

.input-button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--dc-text-muted);
  font-size: 20px;
  padding: 12px 4px;
  flex-shrink: 0;
  opacity: 0.8;
  border-radius: 4px;
  transition: background 0.1s;
}

.input-button:hover {
  background: var(--dc-bg-hover);
}

.detail-input {
  flex: 1;
  background: transparent;
  min-height: 44px;
  max-height: 200px;
  line-height: 1.5;
  border: none;
  outline: none;
  color: var(--dc-text-normal);
  font-size: 15px;
  resize: none;
  font-family: inherit;
  padding: 12px 0;
}

.input-controls {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 8px 4px;
  flex-shrink: 0;
}

.input-hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--dc-text-muted);
  padding: 0 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hint-key {
  color: var(--dc-text-header);
  font-weight: 500;
}

.hint-separator {
  margin: 0 4px;
}
</style>
