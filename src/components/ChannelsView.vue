<template>
  <div class="channels-view">
    <ChannelSidebar :serverName="currentServer?.name" @channelSelect="handleChannelSelect" />
    <ChatArea :activeChannelId="activeChannelId" />
    <MembersSidebar />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ChannelSidebar from './channel-sidebar/ChannelSidebar.vue'
import ChatArea from './chat-area/ChatArea.vue'
import MembersSidebar from './members-sidebar/MembersSidebar.vue'
import { getServerById } from '../api/servers'
import type { Server } from '../api/servers'

const route = useRoute()
const currentServer = ref<Server | null>(null)
const activeChannelId = ref<number | null>(null)

const fetchServerData = async (serverId: string) => {
  try {
    const id = parseInt(serverId)
    if (!isNaN(id)) {
      currentServer.value = await getServerById(id)
    }
  } catch (error) {
    console.error('Failed to fetch server data:', error)
    currentServer.value = null
  }
}

const handleChannelSelect = (channelId: number) => {
  activeChannelId.value = channelId
  console.log('Selected channel ID:', channelId)
}

onMounted(async () => {
  if (route.params.serverId) {
    await fetchServerData(route.params.serverId as string)
  }
})

watch(
  () => route.params.serverId,
  async (newServerId) => {
    if (newServerId) {
      await fetchServerData(newServerId as string)
    }
  },
)
</script>

<style scoped>
.channels-view {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--dc-bg-tertiary);
}
</style>
