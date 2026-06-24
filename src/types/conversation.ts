export interface Conversation {
  id: number
  createdAt: string
  createdBy: number
  description: string | null
  isGroup: boolean
  lastMessageAt: string | null
  name: string | null
  picture: string | null
  type: 'DIRECT' | 'GROUP' | 'CHANNEL'
  updatedAt: string | null
  // Additional properties for UI
  initials?: string
  color?: string
  status?: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY'
  lastMessage?: string
  timestamp?: string
  unread?: boolean
}

export interface CreateConversationRequest {
  name: string
  description?: string
  picture?: string
  participantIds?: number[]
}
