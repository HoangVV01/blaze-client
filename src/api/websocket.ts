import { getToken } from './auth'
import type { MessageDTO } from './messages'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

// STOMP WebSocket connection instance
let stompClient: Client | null = null
let reconnectAttempts = 0
const maxReconnectAttempts = 5
const reconnectDelay = 3000 // 3 seconds
let connectionPromise: Promise<Client> | null = null

// Typing indicator interface
export interface TypingIndicator {
  userId: number
  userName: string
  userPicture?: string
  isTyping: boolean
}

// Event listeners
const messageListeners = new Map<string, (message: MessageDTO) => void>()
const typingListeners = new Map<string, (indicator: TypingIndicator) => void>()
const openListeners = new Map<string, () => void>()
const closeListeners = new Map<string, () => void>()
const errorListeners = new Map<string, (error: any) => void>()

// Track STOMP subscription objects for proper unsubscription
const messageSubscriptions = new Map<string, any>()
const typingSubscriptions = new Map<string, any>()

// Get WebSocket base URL from API base URL
import { getApiBaseUrl } from './auth'

const getWebSocketBaseUrl = (): string => {
  const apiBaseUrl = 'http://localhost:8080'
  return apiBaseUrl
}

// Create STOMP WebSocket connection with promise
export const connectWebSocket = (): Promise<Client> => {
  // If already connecting, return existing promise
  if (connectionPromise) {
    return connectionPromise
  }

  const token = getToken()
  if (!token) {
    throw new Error('No JWT token found')
  }

  const wsUrl = `${getWebSocketBaseUrl()}/ws?token=${token}`

  connectionPromise = new Promise((resolve, reject) => {
    // Create STOMP client
    stompClient = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      debug: (str: string) => {
        // console.log(str)
      },
      reconnectDelay: reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    // Configure connection
    stompClient.onConnect = (frame: any) => {
      console.log('STOMP WebSocket connection established:', frame)
      reconnectAttempts = 0
      openListeners.forEach((callback) => callback())
      resolve(stompClient as Client)
    }

    stompClient.onStompError = (frame: any) => {
      console.error('STOMP WebSocket error:', frame)
      errorListeners.forEach((callback) => callback(frame))
      connectionPromise = null
      reject(frame)
    }

    stompClient.onDisconnect = () => {
      console.log('STOMP WebSocket disconnected')
      closeListeners.forEach((callback) => callback())
      connectionPromise = null

      // Auto-reconnect logic
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++
        console.log(
          `Reconnecting in ${reconnectDelay / 1000} seconds... (Attempt ${reconnectAttempts}/${maxReconnectAttempts})`,
        )
        setTimeout(() => connectWebSocket(), reconnectDelay)
      }
    }

    stompClient.activate()
  })

  return connectionPromise
}

// Disconnect STOMP WebSocket
export const disconnectWebSocket = (): void => {
  if (stompClient) {
    stompClient.deactivate()
    stompClient = null
    connectionPromise = null
  }
}

// Check if STOMP WebSocket is connected
export const isWebSocketConnected = (): boolean => {
  return stompClient !== null && stompClient.connected
}

// Subscribe to conversation messages
export const subscribeToConversation = (
  conversationId: number,
  id: string,
  callback: (message: MessageDTO) => void,
): void => {
  if (!isWebSocketConnected() || !stompClient) {
    console.error('WebSocket is not connected')
    return
  }

  const topic = `/topic/chat/${conversationId}/messages`
  const subscription = stompClient.subscribe(topic, (message: any) => {
    try {
      const messageDTO: MessageDTO = JSON.parse(message.body)
      console.log('Message received:', messageDTO) // Debug log
      callback(messageDTO)
    } catch (error) {
      console.error('Error parsing message:', error)
    }
  })

  messageListeners.set(id, callback)
  messageSubscriptions.set(id, subscription)
}

// Unsubscribe from conversation messages
export const unsubscribeFromConversation = (id: string): void => {
  const subscription = messageSubscriptions.get(id)
  if (subscription) {
    subscription.unsubscribe()
    messageSubscriptions.delete(id)
  }
  messageListeners.delete(id)
}

// Subscribe to typing indicators
export const subscribeToTyping = (
  conversationId: number,
  id: string,
  callback: (indicator: TypingIndicator) => void,
): void => {
  if (!isWebSocketConnected() || !stompClient) {
    console.error('WebSocket is not connected')
    return
  }

  const topic = `/topic/chat/${conversationId}/typing`
  const subscription = stompClient.subscribe(topic, (message: any) => {
    try {
      const indicator: TypingIndicator = JSON.parse(message.body)
      console.log('Typing indicator received:', indicator) // Debug log
      callback(indicator)
    } catch (error) {
      console.error('Error parsing typing indicator:', error)
    }
  })

  typingListeners.set(id, callback)
  typingSubscriptions.set(id, subscription)
}

// Unsubscribe from typing indicators
export const unsubscribeFromTyping = (id: string): void => {
  const subscription = typingSubscriptions.get(id)
  if (subscription) {
    subscription.unsubscribe()
    typingSubscriptions.delete(id)
  }
  typingListeners.delete(id)
}

// Send message via STOMP WebSocket
export const sendWebSocketMessage = (conversationId: number, message: any): void => {
  if (!isWebSocketConnected() || !stompClient) {
    console.error('WebSocket is not connected')
    return
  }

  const destination = `/app/chat/${conversationId}/send`
  stompClient.publish({
    destination,
    body: JSON.stringify(message),
  })
}

// Send typing indicator via STOMP WebSocket
export const sendTypingIndicator = (conversationId: number, isTyping: boolean): void => {
  if (!isWebSocketConnected() || !stompClient) {
    console.error('WebSocket is not connected')
    return
  }

  const destination = isTyping
    ? `/app/chat/${conversationId}/typing`
    : `/app/chat/${conversationId}/stop-typing`
  stompClient.publish({
    destination,
  })
}

// Send mark as read via STOMP WebSocket
export const sendMarkAsRead = (conversationId: number, messageId: number): void => {
  if (!isWebSocketConnected() || !stompClient) {
    console.error('WebSocket is not connected')
    return
  }

  const destination = `/app/chat/${conversationId}/read/${messageId}`
  stompClient.publish({
    destination,
  })
}

// Add open listener
export const onOpen = (id: string, callback: () => void): void => {
  openListeners.set(id, callback)
}

// Remove open listener
export const offOpen = (id: string): void => {
  openListeners.delete(id)
}

// Add close listener
export const onClose = (id: string, callback: () => void): void => {
  closeListeners.set(id, callback)
}

// Remove close listener
export const offClose = (id: string): void => {
  closeListeners.delete(id)
}

// Add error listener
export const onError = (id: string, callback: (error: any) => void): void => {
  errorListeners.set(id, callback)
}

// Remove error listener
export const offError = (id: string): void => {
  errorListeners.delete(id)
}

// Add message listener (backward compatibility)
export const onMessage = (id: string, callback: (message: MessageDTO) => void): void => {
  messageListeners.set(id, callback)
}

// Remove message listener (backward compatibility)
export const offMessage = (id: string): void => {
  messageListeners.delete(id)
}

// Add typing listener (backward compatibility)
export const onTyping = (id: string, callback: (indicator: TypingIndicator) => void): void => {
  typingListeners.set(id, callback)
}

// Remove typing listener (backward compatibility)
export const offTyping = (id: string): void => {
  typingListeners.delete(id)
}
