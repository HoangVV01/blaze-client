// src/api/servers.ts
import axios from 'axios'
import { getToken } from './auth'
import { getApiBaseUrl } from './auth'

axios.defaults.baseURL = `${getApiBaseUrl()}/api`

export interface ServerMember {
  id: number
  userId: number
  username: string | null
  displayName: string | null
  picture: string | null
  joinedAt: string
  role: string
}

export interface Server {
  id: number
  name: string
  description?: string
  picture?: string
  ownerId: number
  createdAt?: string
  updatedAt?: string
  members?: ServerMember[]
  channels?: Channel[]
}

export interface Channel {
  id: number
  name: string
  type?: 'TEXT' | 'VOICE'
  description?: string
  isPublic?: boolean
  createdAt?: string
  updatedAt?: string
  active?: boolean
}

export interface CreateServerRequest {
  name: string
  description?: string
  picture?: string
  participantIds?: number[]
}

export interface CreateChannelRequest {
  name: string
  type?: 'TEXT' | 'VOICE'
  description?: string
}

export async function getMyServers(): Promise<Server[]> {
  const token = getToken()
  if (!token) throw new Error('No JWT token found')
  const res = await axios.get('/servers', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}

export async function createServer(req: CreateServerRequest): Promise<Server> {
  const token = getToken()
  if (!token) throw new Error('No JWT token found')
  const res = await axios.post('/servers', req, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}

export async function getServerById(id: number): Promise<Server> {
  const token = getToken()
  if (!token) throw new Error('No JWT token found')
  const res = await axios.get(`/servers/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}

export async function getServerChannels(serverId: number): Promise<Channel[]> {
  const token = getToken()
  if (!token) throw new Error('No JWT token found')
  const res = await axios.get(`/servers/${serverId}/channels`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}

export async function searchServers(name: string): Promise<Server[]> {
  const token = getToken()
  if (!token) throw new Error('No JWT token found')
  const res = await axios.get('/servers/search', {
    params: { name },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}

export async function createChannel(serverId: number, req: CreateChannelRequest): Promise<Channel> {
  const token = getToken()
  if (!token) throw new Error('No JWT token found')
  const res = await axios.post(`/servers/${serverId}/channels`, req, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}

export async function joinServer(serverId: number): Promise<Server> {
  const token = getToken()
  if (!token) throw new Error('No JWT token found')
  const res = await axios.post(
    `/servers/${serverId}/join`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
  return res.data
}
