<template>
  <div class="chat-area">
    <div class="chat-header">
      <font-awesome-icon icon="hashtag" class="channel-icon" />
      <span class="channel-name">{{ activeChannel?.name || 'general' }}</span>
      <div class="divider"></div>
      <span class="channel-description">{{
        activeChannel?.description || 'Chat about anything!'
      }}</span>
      <div class="header-controls">
        <button class="control-button" title="Toggle Members">
          <font-awesome-icon icon="users" />
        </button>
        <button class="control-button" title="Search">
          <font-awesome-icon icon="magnifying-glass" />
        </button>
        <button class="control-button" title="Inbox">
          <font-awesome-icon icon="inbox" />
        </button>
      </div>
    </div>
    <div class="chat-messages" ref="chatMessagesContainer">
      <MessageGroup v-for="message in messages" :key="message.id" :message="message" />
      <div v-if="typingUsers.size > 0" class="typing-indicator">
        <em>{{ Array.from(typingUsers).join(', ') }} is typing...</em>
      </div>
      <div class="message-spacing"></div>
    </div>
    <div class="chat-input-container">
      <div class="chat-input-wrapper">
        <button class="input-button" title="Attach File">
          <font-awesome-icon icon="paperclip" />
        </button>
        <textarea
          class="chat-input"
          :placeholder="`Message #${activeChannel?.name || 'general'}`"
          rows="1"
          v-model="chatInput"
          @keydown.enter.exact.prevent="sendMessage"
          @input="handleInput"
          ref="inputArea"
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
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, watch, computed } from 'vue'
import MessageGroup from '../shared/MessageGroup.vue'
import { getChannelMessages } from '../../api/messages'
import { connectWebSocket, isWebSocketConnected, getStompClient } from '../../api/websocket'
import type { Client } from '@stomp/stompjs'

interface Props {
  activeChannelId?: number | null
  channels?: Array<{ id: number; name: string; description?: string }>
}

const props = withDefaults(defineProps<Props>(), {
  activeChannelId: null,
  channels: () => [],
})

// Derive active channel info from props
const activeChannel = computed(() => {
  return props.channels.find((ch) => ch.id === props.activeChannelId) || null
})

// WebSocket references
let stompClient: Client | null = null
let messageSubscription: any = null
let typingSubscription: any = null

const messages = ref<any[]>([])
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

// Fetch channel messages
const fetchMessages = async (channelId: number) => {
  try {
    messages.value = await getChannelMessages(channelId)
    scrollToBottom()
  } catch (error) {
    console.error('Failed to fetch channel messages:', error)
    messages.value = []
  }
}

// Setup WebSocket subscription for a channel
const setupChannelWebSocket = async (channelId: number) => {
  try {
    if (!isWebSocketConnected()) {
      await connectWebSocket()
    }

    stompClient = getStompClient()
    if (!stompClient) return

    // Subscribe to channel messages topic
    const msgTopic = `/topic/channels/${channelId}/messages`
    if (messageSubscription) {
      messageSubscription.unsubscribe()
    }
    messageSubscription = stompClient.subscribe(msgTopic, (message: any) => {
      try {
        const msg = JSON.parse(message.body)
        if (!messages.value.some((m) => m.id === msg.id)) {
          messages.value.push(msg)
          scrollToBottom()
        }
      } catch (e) {
        console.error('Error parsing channel message:', e)
      }
    })

    // Subscribe to channel typing topic
    const typingTopic = `/topic/channels/${channelId}/typing`
    if (typingSubscription) {
      typingSubscription.unsubscribe()
    }
    typingSubscription = stompClient.subscribe(typingTopic, (message: any) => {
      try {
        const indicator = JSON.parse(message.body)
        if (indicator.isTyping) {
          typingUsers.value.add(indicator.userName)
          if (typingTimeout) clearTimeout(typingTimeout)
          typingTimeout = setTimeout(() => {
            typingUsers.value.clear()
          }, 3000)
        } else {
          typingUsers.value.delete(indicator.userName)
        }
      } catch (e) {
        console.error('Error parsing typing indicator:', e)
      }
    })
  } catch (error) {
    console.error('Failed to setup channel WebSocket:', error)
  }
}

// Cleanup WebSocket subscriptions
const cleanupWebSocket = () => {
  if (messageSubscription) {
    messageSubscription.unsubscribe()
    messageSubscription = null
  }
  if (typingSubscription) {
    typingSubscription.unsubscribe()
    typingSubscription = null
  }
  if (typingTimeout) {
    clearTimeout(typingTimeout)
    typingTimeout = null
  }
}

onMounted(async () => {
  if (props.activeChannelId) {
    await fetchMessages(props.activeChannelId)
    await setupChannelWebSocket(props.activeChannelId)
  }
  scrollToBottom()
})

onUnmounted(() => {
  cleanupWebSocket()
})

// Watch for active channel changes
watch(
  () => props.activeChannelId,
  async (newId, oldId) => {
    if (oldId === newId) return
    cleanupWebSocket()

    if (newId) {
      messages.value = []
      typingUsers.value.clear()
      await fetchMessages(newId)
      await setupChannelWebSocket(newId)
    } else {
      messages.value = []
      typingUsers.value.clear()
    }
  },
)

function sendMessage() {
  const text = chatInput.value.trim()
  if (!text || !props.activeChannelId) return

  if (stompClient) {
    const destination = `/app/channels/${props.activeChannelId}/send`
    stompClient.publish({
      destination,
      body: JSON.stringify({ content: text, messageType: 'TEXT' }),
    })
  }

  chatInput.value = ''
  if (inputArea.value) inputArea.value.style.height = 'auto'
  nextTick(() => autoResize())
  scrollToBottom()
}

function handleInput() {
  autoResize()
  if (chatInput.value.trim().length > 0 && props.activeChannelId && stompClient) {
    stompClient.publish({
      destination: `/app/channels/${props.activeChannelId}/typing`,
    })
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
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--dc-bg-tertiary);
  min-width: 0;
}

.chat-header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--dc-divider);
  flex-shrink: 0;
}

.channel-icon {
  font-size: 20px;
  color: var(--dc-text-muted);
}

.channel-name {
  font-weight: 700;
  font-size: 15px;
  color: var(--dc-text-header);
}

.divider {
  width: 1px;
  height: 20px;
  background: var(--dc-divider);
  margin: 0 6px;
}

.channel-description {
  font-size: 13px;
  color: var(--dc-text-muted);
}

.header-controls {
  margin-left: auto;
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

.chat-messages {
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

.chat-input-container {
  padding: 0 16px 24px;
  flex-shrink: 0;
}

.chat-input-wrapper {
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

.chat-input {
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
