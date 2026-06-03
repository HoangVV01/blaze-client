// Authentication types

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
  message: string
}

export interface User {
  id: string
  email: string
  username: string
  name?: string
  avatar?: string
  status?: 'online' | 'idle' | 'dnd' | 'offline'
  initials?: string
  createdAt: string
  updatedAt: string
}

export interface RegisterRequest {
  email: string
  password: string
  username: string
  avatar?: string
}

export interface RegisterResponse {
  token: string
  user: User
  message: string
}

export interface ErrorResponse {
  message: string
  error?: string
  statusCode?: number
}
