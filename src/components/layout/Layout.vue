<template>
  <div class="layout">
    <ServerList />
    <div class="main-content">
      <RouterView />
    </div>
    <!-- Floating User Profile Component -->
    <div class="floating-user-profile">
      <UserProfile :user="currentUser" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ServerList from '../server-list/ServerList.vue'
import UserProfile from '../shared/UserProfile.vue'
import { RouterView } from 'vue-router'
import { fetchMe, getCurrentUser } from '@/api/auth'
import type { User } from '@/types/auth'

// Reactive current user data
const currentUser = ref<User>(
  getCurrentUser() || {
    id: '1',
    username: 'Guest',
    email: 'guest@example.com',
    status: 'online' as const,
  },
)

// Fetch latest user info from /me endpoint on mount
onMounted(async () => {
  try {
    const userData = await fetchMe()
    currentUser.value = userData
  } catch (error) {
    console.error('Failed to fetch current user info:', error)
    // Keep existing user data if fetch fails
  }
})
</script>

<style scoped>
.layout {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--dc-bg-primary);
  position: relative;
}

.main-content {
  flex: 1;
  overflow: hidden;
}

.floating-user-profile {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1000;
}
</style>
