<template>
  <div class="avatar-wrapper" @click="handleClick">
    <div class="avatar" :style="avatarStyle">
      {{ initials }}
    </div>
    <div class="status-dot" :style="statusStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  initials?: string
  size?: number
  backgroundColor?: string
  status?: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY'
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initials: 'User',
  size: 40,
  backgroundColor: '#5865f2',
  status: 'ONLINE',
  clickable: false,
})

const emit = defineEmits<{
  click: []
}>()

const avatarStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  background: props.backgroundColor,
  fontSize: `${Math.max(12, props.size * 0.3)}px`,
}))

const statusStyle = computed(() => {
  const statusColors: Record<string, string> = {
    ONLINE: '#23a55a',
    AWAY: '#f0b232',
    BUSY: '#ed4245',
    OFFLINE: '#747f8d',
  }
  return {
    background: statusColors[props.status],
  }
})

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style scoped>
.avatar-wrapper {
  position: relative;
  cursor: pointer;
  display: inline-flex;
}

.avatar {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  user-select: none;
}

.status-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 3px solid var(--dc-bg-sidebar);
}
</style>
