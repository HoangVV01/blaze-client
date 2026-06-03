// User search API
export interface UserSearchResult {
  id: string
  username: string
  email: string
  initials: string
  color: string
}

const getApiBaseUrl = (): string => {
  return localStorage.getItem('api_base_url') || 'http://localhost:8080'
}

export const searchUsers = async (query: string): Promise<UserSearchResult[]> => {
  const baseUrl = getApiBaseUrl()
  const response = await fetch(`${baseUrl}/api/users/search?keyword=${encodeURIComponent(query)}`)
  if (!response.ok) {
    throw new Error('Failed to search users')
  }
  return await response.json()
}
