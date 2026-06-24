// Extract current userId from JWT token
export const getCurrentUserId = (): string | null => {
  const token = getToken()
  if (!token) return null
  try {
    const tokenParts = token.split('.')
    if (tokenParts.length !== 3 || !tokenParts[1]) {
      return null
    }
    const payload = JSON.parse(atob(tokenParts[1]))
    // Try common userId fields
    return payload.userId || payload.id || payload.sub || null
  } catch (e) {
    return null
  }
}
// Authentication API service
import type {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../types/auth'

// Default API base URL from localStorage or fallback
export const getApiBaseUrl = (): string => {
  return localStorage.getItem('api_base_url') || 'http://localhost:8080'
}

// Login API call
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const baseUrl = getApiBaseUrl()
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Login failed with status: ${response.status}`)
  }

  return await response.json()
}

// Register API call (for future use)
export const register = async (userData: any): Promise<any> => {
  const baseUrl = getApiBaseUrl()
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Registration failed with status: ${response.status}`)
  }

  return await response.json()
}

// Get JWT token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem('jwt_token')
}

// Set JWT token in localStorage
export const setToken = (token: string): void => {
  localStorage.setItem('jwt_token', token)
}

// Remove JWT token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem('jwt_token')
  localStorage.removeItem('user')
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken()
  if (!token) {
    return false
  }

  // Basic token validation (check if it's a valid JWT format)
  try {
    const tokenParts = token.split('.')
    if (tokenParts.length !== 3 || !tokenParts[1]) {
      return false
    }

    // Check if token is expired
    const decoded = JSON.parse(atob(tokenParts[1]))
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      removeToken()
      return false
    }

    return true
  } catch (error) {
    console.error('Token validation error:', error)
    return false
  }
}

// Get current user data from localStorage
export const getCurrentUser = (): any => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      return JSON.parse(userData)
    } catch (error) {
      console.error('Failed to parse user data:', error)
      return null
    }
  }
  return null
}

// Fetch current user profile from API (using /me endpoint)
export const fetchCurrentUserProfile = async (): Promise<any> => {
  const token = getToken()
  if (!token) {
    throw new Error('No authentication token found')
  }

  const baseUrl = getApiBaseUrl()
  const response = await fetch(`${baseUrl}/api/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to fetch user profile: ${response.status}`)
  }

  const userData = await response.json()

  // Update user data in localStorage
  localStorage.setItem('user', JSON.stringify(userData))

  return userData
}

// Forgot password API call
export const forgotPassword = async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
  const baseUrl = getApiBaseUrl()
  const response = await fetch(`${baseUrl}/api/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `Forgot password request failed with status: ${response.status}`,
    )
  }

  return await response.json()
}

// Reset password API call
export const resetPassword = async (data: ResetPasswordRequest): Promise<{ message: string }> => {
  const baseUrl = getApiBaseUrl()
  const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Reset password failed with status: ${response.status}`)
  }

  return await response.json()
}

// Logout API call
export const logout = async (): Promise<void> => {
  const baseUrl = getApiBaseUrl()
  const token = getToken()

  try {
    await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Logout API call failed:', error)
  } finally {
    // Always remove token and user data from localStorage
    removeToken()
  }
}

// Alias for /me endpoint for consistency
export const fetchMe = fetchCurrentUserProfile
