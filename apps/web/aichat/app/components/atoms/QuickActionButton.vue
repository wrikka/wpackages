<template>
  <button
    class="quick-action-button"
    :class="{ 
      'is-visible': action.alwaysVisible || isExpanded,
      'is-active': isActive,
      'is-copied': isCopied && action.id === 'copy',
      'is-pinned': isPinned && action.id === 'pin'
    }"
    :title="`${action.label} (${action.shortcut})`"
    @click="action.handler"
  >
    <UIcon :name="action.icon" class="action-icon" />
    <span class="action-tooltip">{{ action.label }}</span>
  </button>
</template>

<script setup lang="ts">
import type { QuickAction } from '~/types/quick-actions'

interface QuickActionButtonProps {
  action: QuickAction
  isExpanded?: boolean
  isActive?: boolean
  isCopied?: boolean
  isPinned?: boolean
}

withDefaults(defineProps<QuickActionButtonProps>(), {
  isExpanded: false,
  isActive: false,
  isCopied: false,
  isPinned: false
})
</script>

<style scoped>
.quick-action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  border: none;
  background: transparent;
  color: rgba(107, 114, 128, 1);
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
  outline: none;
}

.quick-action-button:hover {
  background: rgba(243, 244, 246, 1);
  color: rgba(17, 24, 39, 1);
}

.dark .quick-action-button:hover {
  background: rgba(55, 65, 81, 1);
  color: rgba(243, 244, 246, 1);
}

.quick-action-button.is-active,
.quick-action-button.is-copied,
.quick-action-button.is-pinned {
  background: rgba(59, 130, 246, 1);
  color: white;
}

.quick-action-button.is-negative {
  background: rgba(239, 68, 68, 1);
  color: white;
}

.action-icon {
  width: 1rem;
  height: 1rem;
}

.action-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(17, 24, 39, 1);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
  margin-bottom: 0.25rem;
  z-index: 10;
}

.quick-action-button:hover .action-tooltip {
  opacity: 1;
}
</style>
