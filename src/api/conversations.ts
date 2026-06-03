// src/api/conversations.ts
import axios from 'axios'
import { getToken } from './auth'
import { getApiBaseUrl } from './auth'
import type { Conversation, CreateConversationRequest } from '../types/conversation'

axios.defaults.baseURL = `${getApiBaseUrl()}/api`

export async function getMyConversations(): Promise<Conversation[]> {
  const token = getToken()
  if (!token) throw new Error('No JWT token found')
  const res = await axios.get('/conversations', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}

export async function getMyGroupConversations(): Promise<Conversation[]> {
  const token = getToken()
  if (!token) throw new Error('No JWT token found')
  const res = await axios.get('/conversations/groups', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}

export async function createDirectConversation(targetUserId: any): Promise<Conversation> {
  const token = getToken()
  if (!token) throw new Error('No JWT token found')
  const res = await axios.post(
    '/conversations/direct',
    { targetUserId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
  return res.data
}

export async function createGroupConversation(
  req: CreateConversationRequest,
): Promise<Conversation> {
  const token = getToken()
  if (!token) throw new Error('No JWT token found')
  const res = await axios.post('/conversations/group', req, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}

export async function createServerConversation(
  req: CreateConversationRequest,
): Promise<Conversation> {
  const token = getToken()
  if (!token) throw new Error('No JWT token found')
  const res = await axios.post('/conversations/server', req, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}

export async function getConversationById(id: number): Promise<Conversation> {
  const token = getToken()
  if (!token) throw new Error('No JWT token found')
  const res = await axios.get(`/conversations/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}

export async function addParticipant(
  conversationId: number,
  userId: number,
): Promise<Conversation> {
  const token = getToken()
  if (!token) throw new Error('No JWT token found')
  const res = await axios.post(
    `/conversations/${conversationId}/participants`,
    { userId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
  return res.data
}

export async function removeParticipant(
  conversationId: number,
  userId: number,
): Promise<Conversation> {
  const token = getToken()
  if (!token) throw new Error('No JWT token found')
  const res = await axios.delete(`/conversations/${conversationId}/participants/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}

export async function updateConversation(
  conversationId: number,
  req: CreateConversationRequest,
): Promise<Conversation> {
  const token = getToken()
  if (!token) throw new Error('No JWT token found')
  const res = await axios.put(`/conversations/${conversationId}`, req, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}
