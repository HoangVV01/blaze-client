<template>
  <div class="channel-sidebar">
    <div class="server-header">
      <span>{{ serverName }}</span>
      <font-awesome-icon icon="chevron-down" class="dropdown-icon" />
    </div>
    <div class="channels-container">
      <div v-if="channels.length === 0" class="no-channels">
        <span>No channels available</span>
      </div>
      <div
        v-for="channel in channels"
        :key="channel.id"
        class="channel-item"
        :class="{ active: channel.active }"
        @click="selectChannel(channel)"
      >
        <font-awesome-icon :icon="getChannelIcon(channel)" class="channel-icon" />
        <span class="channel-name">{{ channel.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getServerChannels } from '../../api/servers'
import type { Channel } from '../../api/servers'

interface Props {
  serverName?: string
  serverId?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  serverName: 'Awesome Devs',
  serverId: null,
})

const channels = ref<Channel[]>([])

// Function to fetch channels from API
const fetchChannels = async () => {
  if (!props.serverId) {
    channels.value = []
    return
  }

  try {
    const fetchedChannels = await getServerChannels(props.serverId)
    const channelsArray = fetchedChannels || []
    channels.value = channelsArray.map((channel) => ({
      ...channel,
      active: false,
    }))

    // Set first channel as active by default
    // if (channels.value.length > 0) {
    //   channels.value[0].active = true
    // }
  } catch (error) {
    console.error('Failed to fetch channels:', error)
    channels.value = []
  }
}

const emit = defineEmits(['channelSelect'])

const selectChannel = (channel: Channel) => {
  // Remove active state from all channels
  channels.value.forEach((ch) => (ch.active = false))
  // Set active state to selected channel
  channel.active = true
  // Emit event to notify parent component
  emit('channelSelect', channel.id)
  console.log('Selected channel:', channel)
}

const getChannelIcon = (channel: Channel) => {
  return channel.type === 'VOICE' ? 'volume-high' : 'hashtag'
}

onMounted(async () => {
  await fetchChannels()
})
</script>

<style scoped>
.channel-sidebar {
  width: 240px;
  min-width: 240px;
  background: var(--dc-bg-sidebar);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.server-header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--dc-divider);
  cursor: pointer;
  font-weight: 700;
  font-size: 15px;
  color: var(--dc-text-header);
}

.dropdown-icon {
  font-size: 12px;
  color: var(--dc-text-muted);
}

.channels-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 8px 0;
}

.no-channels {
  padding: 16px;
  text-align: center;
  color: var(--dc-text-muted);
  font-size: 14px;
}

.channel-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.1s ease;
  color: var(--dc-text-muted);
}

.channel-item:hover {
  background: var(--dc-bg-hover);
  color: var(--dc-text-normal);
}

.channel-item.active {
  background: var(--dc-bg-hover);
  color: var(--dc-text-normal);
}

.channel-icon {
  font-size: 18px;
  line-height: 1;
}

.channel-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
}
</style>
