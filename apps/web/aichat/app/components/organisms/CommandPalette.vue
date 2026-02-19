<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { CommandPaletteAction } from '~/types/command-palette'
import { COMMAND_PALETTE_ACTIONS } from '~/constants/command-palette'
import { useCommandPaletteSearch } from '~/composables/ui/useCommandPaletteSearch'
import { useCommandPaletteRecent } from '~/composables/ui/useCommandPaletteRecent'
import CommandPaletteSearch from '../molecules/command-palette/CommandPaletteSearch.vue'
import CommandPaletteResults from '../molecules/command-palette/CommandPaletteResults.vue'
import CommandPaletteFooter from '../molecules/command-palette/CommandPaletteFooter.vue'

interface CommandPaletteProps {
  isOpen?: boolean
  placeholder?: string
  maxResults?: number
}

const props = withDefaults(defineProps<CommandPaletteProps>(), {
  isOpen: false,
  placeholder: "Type a command or search...",
  maxResults: 10
})

const emit = defineEmits<{
  close: []
  'action-execute': [action: CommandPaletteAction]
}>()

// Composables
const { filterActions, groupActions } = useCommandPaletteSearch()
const { getRecentActions, addToRecent, saveRecentActions } = useCommandPaletteRecent()

// State
const searchQuery = ref('')
const selectedIndex = ref(0)
const searchComponent = ref<InstanceType<typeof CommandPaletteSearch> | null>(null)
const recentActions = ref<CommandPaletteAction[]>(getRecentActions())
const isLoading = ref(false)

// Computed
const filteredActions = computed(() => {
  const baseActions = searchQuery.value.trim() ? COMMAND_PALETTE_ACTIONS : recentActions.value
  const filtered = filterActions(baseActions, searchQuery.value)
  return filtered.slice(0, props.maxResults)
})

const groupedActions = computed(() => {
  return groupActions(filteredActions.value)
})

const hasResults = computed(() => filteredActions.value.length > 0)
const isSearchMode = computed(() => searchQuery.value.trim().length > 0)

// Methods
const executeAction = (action: CommandPaletteAction) => {
  emit('action-execute', action)
  
  // Add to recent actions
  const updatedRecent = addToRecent(action)
  recentActions.value = updatedRecent
  saveRecentActions(updatedRecent)
  
  handleClose()
}

const handleClose = () => {
  emit('close')
  searchQuery.value = ''
  selectedIndex.value = 0
}

const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, filteredActions.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      if (filteredActions.value[selectedIndex.value]) {
        executeAction(filteredActions.value[selectedIndex.value])
      }
      break
    case 'Escape':
      event.preventDefault()
      handleClose()
      break
  }
}

const handleSelectIndex = (index: number) => {
  selectedIndex.value = index
}

// Watchers
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    searchComponent.value?.focus()
  }
})

watch(() => searchQuery.value, () => {
  selectedIndex.value = 0
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="command-palette-overlay" @click="handleClose">
        <div class="command-palette" @click.stop>
          <!-- Search Input -->
          <CommandPaletteSearch
            ref="searchComponent"
            v-model="searchQuery"
            :placeholder="placeholder"
            :result-count="filteredActions.length"
            @keydown="handleKeyDown"
            @clear="searchQuery = ''"
          />

          <!-- Results -->
          <CommandPaletteResults
            :actions="filteredActions"
            :grouped-actions="groupedActions"
            :selected-index="selectedIndex"
            :has-results="hasResults"
            @action-select="executeAction"
            @select-index="handleSelectIndex"
          />

          <!-- Footer -->
          <CommandPaletteFooter :is-search-mode="isSearchMode" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.command-palette-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 10vh;
}

.command-palette {
  width: 90vw;
  max-width: 600px;
  max-height: 80vh;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dark .command-palette {
  background: rgba(17, 24, 39, 1);
  border: 1px solid rgba(55, 65, 81, 1);
}

.search-container {
  padding: 1rem;
  border-bottom: 1px solid rgba(229, 231, 235, 1);
}

.dark .search-container {
  border-bottom-color: rgba(55, 65, 81, 1);
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(249, 250, 251, 1);
  border-radius: 0.5rem;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.dark .search-input-wrapper {
  background: rgba(31, 41, 55, 1);
}

.search-input-wrapper:focus-within {
  border-color: rgba(59, 130, 246, 1);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: rgba(107, 114, 128, 1);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1rem;
  color: rgba(17, 24, 39, 1);
}

.dark .search-input {
  color: rgba(243, 244, 246, 1);
}

.search-input::placeholder {
  color: rgba(107, 114, 128, 1);
}

.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: transparent;
  color: rgba(107, 114, 128, 1);
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.clear-button:hover {
  background: rgba(229, 231, 235, 1);
  color: rgba(17, 24, 39, 1);
}

.dark .clear-button:hover {
  background: rgba(55, 65, 81, 1);
  color: rgba(243, 244, 246, 1);
}

.search-stats {
  margin-top: 0.5rem;
  padding: 0 0.25rem;
}

.stats-text {
  font-size: 0.75rem;
  color: rgba(107, 114, 128, 1);
}

.results-container {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.no-results-icon {
  width: 3rem;
  height: 3rem;
  color: rgba(209, 213, 219, 1);
  margin-bottom: 1rem;
}

.no-results-text {
  font-size: 1rem;
  font-weight: 500;
  color: rgba(55, 65, 81, 1);
  margin-bottom: 0.5rem;
}

.dark .no-results-text {
  color: rgba(209, 213, 219, 1);
}

.no-results-hint {
  font-size: 0.875rem;
  color: rgba(107, 114, 128, 1);
}

.results-groups {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-group {
  display: flex;
  flex-direction: column;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(107, 114, 128, 1);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.group-icon {
  width: 1rem;
  height: 1rem;
}

.group-title {
  flex: 1;
}

.group-count {
  opacity: 0.7;
}

.group-actions {
  display: flex;
  flex-direction: column;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  border-radius: 0.5rem;
  margin: 0 0.5rem 0.25rem 0.5rem;
}

.action-item:hover,
.action-item.is-selected {
  background: rgba(243, 244, 246, 1);
}

.dark .action-item:hover,
.dark .action-item.is-selected {
  background: rgba(55, 65, 81, 1);
}

.action-item.is-selected {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.dark .action-item.is-selected {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: rgba(243, 244, 246, 1);
  border-radius: 0.375rem;
  color: rgba(55, 65, 81, 1);
  flex-shrink: 0;
}

.dark .action-icon {
  background: rgba(55, 65, 81, 1);
  color: rgba(209, 213, 219, 1);
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(17, 24, 39, 1);
  margin-bottom: 0.125rem;
}

.dark .action-title {
  color: rgba(243, 244, 246, 1);
}

.action-description {
  font-size: 0.75rem;
  color: rgba(107, 114, 128, 1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-shortcut {
  font-size: 0.75rem;
  font-family: monospace;
  color: rgba(107, 114, 128, 1);
  background: rgba(243, 244, 246, 1);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.dark .action-shortcut {
  background: rgba(55, 65, 81, 1);
  color: rgba(156, 163, 175, 1);
}

.footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(229, 231, 235, 1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dark .footer {
  border-top-color: rgba(55, 65, 81, 1);
}

.footer-hints {
  display: flex;
  gap: 1rem;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: rgba(107, 114, 128, 1);
}

kbd {
  background: rgba(243, 244, 246, 1);
  border: 1px solid rgba(209, 213, 219, 1);
  border-radius: 0.25rem;
  padding: 0.125rem 0.375rem;
  font-family: monospace;
  font-size: 0.75rem;
  color: rgba(55, 65, 81, 1);
}

.dark kbd {
  background: rgba(55, 65, 81, 1);
  border-color: rgba(75, 85, 99, 1);
  color: rgba(209, 213, 219, 1);
}

.footer-info {
  font-size: 0.75rem;
  color: rgba(107, 114, 128, 1);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .command-palette,
.modal-leave-to .command-palette {
  transform: scale(0.95) translateY(-10px);
  opacity: 0;
}

.modal-enter-active .command-palette,
.modal-leave-active .command-palette {
  transition: all 0.2s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .command-palette-overlay {
    padding: 1rem;
    align-items: flex-start;
  }
  
  .command-palette {
    width: 100%;
    max-height: 90vh;
  }
  
  .footer-hints {
    display: none;
  }
}
</style>
