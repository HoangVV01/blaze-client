<template>
  <div class="user-profile">
    <div class="user-avatar">
      <Avatar
        :initials="user.initials || getInitials(user.name || user.username)"
        :size="32"
        backgroundColor="#5865f2"
        :status="user.status || 'ONLINE'"
      />
    </div>
    <div class="user-info">
      <div class="username">{{ user.username }}</div>
      <div class="user-email">{{ user.email }}</div>
    </div>
    <div class="user-controls">
      <button class="control-button" title="Voice" @click="toggleMute">
        <font-awesome-icon :icon="isMuted ? 'microphone-slash' : 'microphone'" />
      </button>
      <button class="control-button" title="Deafen" @click="toggleDeafen">
        <font-awesome-icon :icon="isDeafened ? 'volume-xmark' : 'volume-high'" />
      </button>
      <div class="settings-container" @click="toggleDropdown" @blur="closeDropdown" tabindex="0">
        <button class="control-button" title="Settings">
          <font-awesome-icon icon="gear" />
        </button>
        <div class="dropdown-menu" v-if="isDropdownOpen">
          <button class="dropdown-item" @click="handleLogout">
            <font-awesome-icon icon="right-from-bracket" />
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Avatar from './Avatar.vue'
import type { User } from '@/types/auth'
import { ref } from 'vue'
import { logout } from '@/api/auth'
import { useRouter } from 'vue-router'

interface Props {
  user: User
}

defineProps<Props>()

const router = useRouter()
const isMuted = ref(false)
const isDeafened = ref(false)
const isDropdownOpen = ref(false)

const toggleMute = () => {
  isMuted.value = !isMuted.value
}

const toggleDeafen = () => {
  isDeafened.value = !isDeafened.value
}

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const handleLogout = async () => {
  try {
    await logout()
    isDropdownOpen.value = false
    // Redirect to login page after logout
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Helper function to generate initials from name or username
const getInitials = (name: string): string => {
  if (!name) return 'G' // Default to 'G' for Guest
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<style scoped>
.user-profile {
  height: 52px;
  background: #232428;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid var(--dc-divider);
  border-radius: 8px 8px 0 0;
  margin: 0 8px 0 8px;
  min-width: 240px;
  max-width: 240px;
}

.user-avatar {
  position: relative;
  cursor: pointer;
}

.user-info {
  flex: 1;
  overflow: hidden;
}

.username {
  font-size: 13px;
  font-weight: 600;
  color: var(--dc-text-header);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 11px;
  color: var(--dc-text-muted);
}

.user-controls {
  display: flex;
  gap: 4px;
}

.control-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: var(--dc-text-muted);
  font-size: 16px;
  transition: background-color 0.1s ease;
}

.control-button:hover {
  background: var(--dc-bg-hover);
}

.settings-container {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  background: #2f3136;
  border: 1px solid var(--dc-divider);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  min-width: 180px;
  z-index: 1000;
}

.dropdown-item {
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  padding: 12px 16px;
  text-align: left;
  color: var(--dc-text-header);
  font-size: 14px;
  transition: background-color 0.1s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
}

.dropdown-item:hover {
  background: var(--dc-bg-hover);
}

.dropdown-item:first-child {
  border-radius: 8px 8px 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 8px 8px;
}

/* Focus styles for accessibility */
.settings-container:focus {
  outline: none;
}
</style>
