// src/api/messages.ts
import axios from 'axios'
import { getToken } from './auth'
import { getApiBaseUrl } from './auth'

axios.defaults.baseURL = `${getApiBaseUrl()}/api`

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  FILE = 'FILE',
  AUDIO = 'AUDIO',
  SYSTEM = 'SYSTEM',
  JOIN = 'JOIN',
  LEAVE = 'LEAVE',
}

export enum MessageStatus {
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

export interface MessageDTO {
  id: number
  conversationId: number
  senderId: number
  senderName: string
  senderPicture?: string
  content: string
  messageType: MessageType
  mediaUrl?: string
  mediaType?: string
  fileName?: string
  fileSize?: number
  status: MessageStatus
  isEdited: boolean
  isDeleted: boolean
  replyToId?: number | null
  createdAt?: string
  updatedAt?: string
}

export interface SendMessageRequest {
  conversationId: number
  content: string
  messageType?: MessageType
  mediaUrl?: string
  mediaType?: string
  fileName?: string
  fileSize?: number
  replyToId?: number | null
}

export async function getMessages(conversationId: number): Promise<MessageDTO[]> {
  const token = getToken()
  if (!token) throw new Error('No JWT token found')
  const res = await axios.get('/messages', {
    params: { conversationId },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}

export async function getChannelMessages(channelId: number): Promise<MessageDTO[]> {
  const token = getToken()
  if (!token) throw new Error('No JWT token found')
  const res = await axios.get(`/channels/${channelId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}

export async function sendChannelMessage(channelId: number, content: string): Promise<MessageDTO> {
  const token = getToken()
  if (!token) throw new Error('No JWT token found')
  const res = await axios.post(
    `/channels/${channelId}/messages`,
    { content, messageType: MessageType.TEXT },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
  return res.data
}

export async function sendMessage(req: SendMessageRequest): Promise<MessageDTO> {
  const token = getToken()
  if (!token) throw new Error('No JWT token found')
  const res = await axios.post('/messages', req, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}
