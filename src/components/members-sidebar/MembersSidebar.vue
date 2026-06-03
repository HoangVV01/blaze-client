<template>
  <div class="members-sidebar">
    <div class="members-section">
      <div class="section-header">Online — 2</div>
      <!-- Member items should be rendered dynamically from real user/member data -->
    </div>
  </div>
</template>

<script setup lang="ts">
import Avatar from '../shared/Avatar.vue'
</script>

<style scoped>
.members-sidebar {
  width: 240px;
  min-width: 240px;
  background: var(--dc-bg-secondary);
  overflow-y: auto;
  padding: 16px 8px;
}

.members-section {
  margin-bottom: 16px;
}

.section-header {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--dc-text-muted);
  padding: 16px 8px 4px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.member-item:hover {
  background: var(--dc-bg-hover);
}

.member-avatar {
  position: relative;
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--dc-text-header);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-status {
  font-size: 11px;
  color: var(--dc-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
