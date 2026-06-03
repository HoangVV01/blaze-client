<template>
  <div class="server-list">
    <ServerIcon
      icon="house"
      color="var(--dc-accent)"
      :isActive="activeServerId === 'home'"
      @click="handleServerClick('home')"
    />
    <div class="server-divider"></div>
    <!-- Display user's servers -->
    <ServerIcon
      v-for="server in userServers"
      :key="server.id"
      :initials="getServerInitials(server.name)"
      :color="getServerColor(server.id)"
      :isActive="activeServerId === server.id.toString()"
      @click="handleServerClick(server.id.toString())"
    />
    <ServerIcon
      icon="plus"
      color="rgba(255, 255, 255, 0.07)"
      showIndicator
      @click="handleAddServer"
    />
  </div>

  <AddServerModal
    v-model="isAddServerModalVisible"
    @createServer="handleCreateServer"
    @joinServer="handleJoinServer"
  />

  <CreateServerModal v-model="isCreateServerModalVisible" @createServer="handleServerCreated" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ServerIcon from '../shared/ServerIcon.vue'
import AddServerModal from '../shared/AddServerModal.vue'
import CreateServerModal from '../shared/CreateServerModal.vue'
import { getMyServers, createServer, joinServer } from '../../api/servers'
import type { CreateServerRequest, Server } from '../../api/servers'

const router = useRouter()
const route = useRoute()
const activeServerId = ref('home')
const isAddServerModalVisible = ref(false)
const isCreateServerModalVisible = ref(false)
const userServers = ref<Server[]>([])

// Sync active server with route parameter
watch(
  () => route.params.serverId,
  (newServerId) => {
    if (newServerId) {
      activeServerId.value = newServerId as string
    } else {
      activeServerId.value = 'home'
    }
  },
  { immediate: true },
)

// Fetch user's servers on mount
onMounted(async () => {
  try {
    const servers = await getMyServers()
    userServers.value = servers
  } catch (error) {
    console.error('Failed to fetch servers:', error)
  }
})

const handleServerClick = (serverId: string) => {
  activeServerId.value = serverId

  if (serverId === 'home') {
    router.push('/conversations')
  } else {
    router.push(`/${serverId}`)
  }
}

const handleAddServer = () => {
  isAddServerModalVisible.value = true
}

const handleCreateServer = () => {
  isAddServerModalVisible.value = false
  isCreateServerModalVisible.value = true
}

const handleJoinServer = async () => {
  const serverIdInput = prompt('Enter server ID to join:')
  if (serverIdInput) {
    const serverId = parseInt(serverIdInput.trim())
    if (!isNaN(serverId)) {
      try {
        const server = await joinServer(serverId)
        console.log('Server joined:', server)
        userServers.value.push(server)
        handleServerClick(server.id.toString())
      } catch (error) {
        console.error('Failed to join server:', error)
        alert('Failed to join server. Please try again.')
      }
    } else {
      alert('Please enter a valid server ID')
    }
  }
}

const handleServerCreated = async (serverData: { name: string }) => {
  try {
    const request: CreateServerRequest = {
      name: serverData.name,
    }

    const server = await createServer(request)
    console.log('Server created:', server)

    // Add new server to the list
    userServers.value.push(server)
    // Navigate to the new server
    handleServerClick(server.id.toString())
  } catch (error) {
    console.error('Failed to create server:', error)
    alert('Failed to create server. Please try again.')
  }
}

// Helper to get server initials for icon
const getServerInitials = (name?: string): string => {
  if (!name) return '?'
  return (name || '').substring(0, 2).toUpperCase()
}

// Helper to get consistent color for server icon based on id
const getServerColor = (_serverId: number | string): string => {
  return '#5865f2' // Discord blue
}
</script>

<style scoped>
.server-list {
  width: 72px;
  min-width: 72px;
  background: var(--dc-bg-server);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 8px;
  overflow-y: auto;
  position: relative;
}

.server-divider {
  width: 32px;
  height: 2px;
  background: var(--dc-divider);
  border-radius: 1px;
}
</style>
