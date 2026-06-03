<template>
  <div class="server-icon-wrapper">
    <div
      class="server-icon"
      :class="{ active: isActive }"
      :style="serverIconStyle"
      @click="handleClick"
    >
      <font-awesome-icon v-if="icon" :icon="['fas', icon]" :style="{ fontSize: '20px' }" />
      <span v-else>{{ initials || '?' }}</span>
    </div>
    <div v-if="showIndicator" class="server-indicator" :style="indicatorStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon?: string
  initials?: string
  color?: string
  isActive?: boolean
  showIndicator?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: '',
  initials: '',
  color: '#5865f2',
  isActive: false,
  showIndicator: false,
})

const emit = defineEmits<{
  click: []
}>()

const serverIconStyle = computed(() => ({
  background: props.color,
}))

const indicatorStyle = computed(() => ({
  background: props.color,
}))

const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
.server-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
}

.server-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  position: relative;
  z-index: 1;
}

.server-icon:hover {
  border-radius: 16px;
  width: 48px;
  height: 48px;
}

.server-icon.active {
  border-radius: 16px;
  width: 48px;
  height: 48px;
}

.server-icon:hover::before,
.server-icon.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 40px;
  background: white;
  border-radius: 0 4px 4px 0;
}

.server-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 40px;
  border-radius: 0 4px 4px 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.server-icon:hover ~ .server-indicator,
.server-icon.active ~ .server-indicator {
  opacity: 1;
}
</style>
