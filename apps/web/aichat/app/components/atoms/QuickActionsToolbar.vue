<script setup lang="ts">
import { ref, computed } from 'vue'

interface QuickActionsToolbarProps {
  messageId: string
  content: string
  role: 'user' | 'assistant'
  isStreaming?: boolean
  showOnHover?: boolean
  position?: 'top-right' | 'bottom-left' | 'floating'
}

const props = withDefaults(defineProps<QuickActionsToolbarProps>(), {
  isStreaming: false,
  showOnHover: true,
  position: 'top-right'
})

const emit = defineEmits<{
  copy: [content: string]
  regenerate: []
  feedback: [type: 'like' | 'dislike']
  share: [messageId: string]
  edit: [messageId: string]
  fork: [messageId: string]
  pin: [messageId: string]
  speak: [content: string]
  translate: [content: string]
  explain: [content: string]
  'apply-to-workspace': [content: string]
}>()

// State
const isExpanded = ref(false)
const copiedText = ref(false)
const feedbackGiven = ref<'like' | 'dislike' | null>(null)
const isPinned = ref(false)

// Computed
const availableActions = computed(() => {
  const actions = [
    {
      id: 'copy',
      label: 'Copy',
      icon: 'i-heroicons-clipboard-document',
      shortcut: 'Ctrl+C',
      alwaysVisible: true,
      handler: () => handleCopy()
    },
    {
      id: 'regenerate',
      label: 'Regenerate',
      icon: 'i-heroicons-arrow-path',
      shortcut: 'Ctrl+R',
      alwaysVisible: props.role === 'assistant',
      handler: () => emit('regenerate')
    },
    {
      id: 'like',
      label: 'Like',
      icon: feedbackGiven.value === 'like' ? 'i-heroicons-hand-thumb-up-solid' : 'i-heroicons-hand-thumb-up',
      shortcut: 'Ctrl+L',
      alwaysVisible: props.role === 'assistant',
      handler: () => handleFeedback('like')
    },
    {
      id: 'dislike',
      label: 'Dislike',
      icon: feedbackGiven.value === 'dislike' ? 'i-heroicons-hand-thumb-down-solid' : 'i-heroicons-hand-thumb-down',
      shortcut: 'Ctrl+D',
      alwaysVisible: props.role === 'assistant',
      handler: () => handleFeedback('dislike')
    },
    {
      id: 'share',
      label: 'Share',
      icon: 'i-heroicons-share',
      shortcut: 'Ctrl+S',
      alwaysVisible: true,
      handler: () => emit('share', props.messageId)
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: 'i-heroicons-pencil',
      shortcut: 'Ctrl+E',
      alwaysVisible: props.role === 'user',
      handler: () => emit('edit', props.messageId)
    },
    {
      id: 'fork',
      label: 'Fork',
      icon: 'i-heroicons-arrows-pointing-out',
      shortcut: 'Ctrl+F',
      alwaysVisible: true,
      handler: () => emit('fork', props.messageId)
    },
    {
      id: 'pin',
      label: isPinned.value ? 'Unpin' : 'Pin',
      icon: isPinned.value ? 'i-heroicons-pin-solid' : 'i-heroicons-pin',
      shortcut: 'Ctrl+P',
      alwaysVisible: true,
      handler: () => handlePin()
    },
    {
      id: 'speak',
      label: 'Speak',
      icon: 'i-heroicons-speaker-wave',
      shortcut: 'Ctrl+T',
      alwaysVisible: props.role === 'assistant' && props.content.length > 0,
      handler: () => emit('speak', props.content)
    },
    {
      id: 'translate',
      label: 'Translate',
      icon: 'i-heroicons-language',
      shortcut: 'Ctrl+Shift+T',
      alwaysVisible: false,
      handler: () => emit('translate', props.content)
    },
    {
      id: 'explain',
      label: 'Explain',
      icon: 'i-heroicons-light-bulb',
      shortcut: 'Ctrl+Shift+E',
      alwaysVisible: false,
      handler: () => emit('explain', props.content)
    },
    {
      id: 'apply-to-workspace',
      label: 'Apply to Workspace',
      icon: 'i-heroicons-rocket-launch',
      shortcut: 'Ctrl+Shift+A',
      alwaysVisible: false,
      handler: () => emit('apply-to-workspace', props.content)
    }
  ]

  return actions.filter(action => action.alwaysVisible || isExpanded.value)
})

const visibleActions = computed(() => {
  return availableActions.value.slice(0, isExpanded.value ? undefined : 4)
})

const hasMoreActions = computed(() => {
  return availableActions.value.length > 4
})

// Methods
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.content)
    copiedText.value = true
    emit('copy', props.content)
    
    setTimeout(() => {
      copiedText.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy text:', error)
  }
}

const handleFeedback = (type: 'like' | 'dislike') => {
  if (feedbackGiven.value === type) {
    feedbackGiven.value = null
  } else {
    feedbackGiven.value = type
  }
  emit('feedback', type)
}

const handlePin = () => {
  isPinned.value = !isPinned.value
  emit('pin', props.messageId)
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const handleKeyDown = (event: KeyboardEvent) => {
  // Handle keyboard shortcuts when toolbar is focused
  const action = availableActions.value.find(a => 
    a.shortcut === getShortcutString(event)
  )
  
  if (action) {
    event.preventDefault()
    action.handler()
  }
}

const getShortcutString = (event: KeyboardEvent): string => {
  const parts = []
  if (event.ctrlKey) parts.push('Ctrl')
  if (event.shiftKey) parts.push('Shift')
  if (event.altKey) parts.push('Alt')
  if (event.metaKey) parts.push('Meta')
  
  if (event.key && !['Control', 'Shift', 'Alt', 'Meta'].includes(event.key)) {
    parts.push(event.key.toUpperCase())
  }
  
  return parts.join('+')
}

// Keyboard shortcuts
useKeyboardShortcuts([
  {
    key: 'c',
    ctrlKey: true,
    handler: handleCopy,
    description: 'Copy message'
  },
  {
    key: 'r',
    ctrlKey: true,
    handler: () => emit('regenerate'),
    description: 'Regenerate response',
    enabled: () => props.role === 'assistant'
  },
  {
    key: 'l',
    ctrlKey: true,
    handler: () => handleFeedback('like'),
    description: 'Like response',
    enabled: () => props.role === 'assistant'
  },
  {
    key: 'd',
    ctrlKey: true,
    handler: () => handleFeedback('dislike'),
    description: 'Dislike response',
    enabled: () => props.role === 'assistant'
  }
])
</script>

<template>
  <div 
    class="quick-actions-toolbar"
    :class="[
      `position-${position}`,
      { 'show-on-hover': showOnHover },
      { 'is-expanded': isExpanded }
    ]"
    @keydown="handleKeyDown"
    tabindex="0"
    :aria-label="'Quick actions for message'"
  >
    <!-- Primary Actions -->
    <div class="actions-container">
      <div class="actions-list">
        <button
          v-for="action in visibleActions"
          :key="action.id"
          class="action-button"
          :class="{
            'is-active': action.id === 'like' && feedbackGiven === 'like',
            'is-negative': action.id === 'dislike' && feedbackGiven === 'dislike',
            'is-copied': action.id === 'copy' && copiedText,
            'is-pinned': action.id === 'pin' && isPinned
          }"
          :title="`${action.label} (${action.shortcut})`"
          @click="action.handler"
        >
          <UIcon :name="action.icon" class="w-4 h-4" />
          <span class="action-tooltip">{{ action.label }}</span>
        </button>
        
        <!-- More Actions Button -->
        <button
          v-if="hasMoreActions"
          class="action-button more-button"
          :class="{ 'is-active': isExpanded }"
          title="More actions"
          @click="toggleExpanded"
        >
          <UIcon 
            :name="isExpanded ? 'i-heroicons-x-mark-20-solid' : 'i-heroicons-ellipsis-horizontal'" 
            class="w-4 h-4" 
          />
          <span class="action-tooltip">More actions</span>
        </button>
      </div>
    </div>

    <!-- Expanded Actions Panel -->
    <Transition name="expand">
      <div v-if="isExpanded" class="expanded-panel">
        <div class="expanded-actions">
          <button
            v-for="action in availableActions.filter(a => !visibleActions.includes(a))"
            :key="action.id"
            class="expanded-action-button"
            :title="`${action.label} (${action.shortcut})`"
            @click="action.handler"
          >
            <UIcon :name="action.icon" class="w-4 h-4" />
            <span class="action-label">{{ action.label }}</span>
            <span class="action-shortcut">{{ action.shortcut }}</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Status Indicators -->
    <div class="status-indicators">
      <!-- Copied Indicator -->
      <Transition name="fade">
        <div v-if="copiedText" class="status-indicator copied">
          <UIcon name="i-heroicons-check" class="w-3 h-3" />
          Copied!
        </div>
      </Transition>

      <!-- Feedback Indicator -->
      <Transition name="fade">
        <div v-if="feedbackGiven" class="status-indicator feedback">
          <UIcon 
            :name="feedbackGiven === 'like' ? 'i-heroicons-hand-thumb-up' : 'i-heroicons-hand-thumb-down'" 
            class="w-3 h-3" 
          />
          {{ feedbackGiven === 'like' ? 'Liked' : 'Disliked' }}
        </div>
      </Transition>

      <!-- Pinned Indicator -->
      <Transition name="fade">
        <div v-if="isPinned" class="status-indicator pinned">
          <UIcon name="i-heroicons-pin" class="w-3 h-3" />
          Pinned
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.quick-actions-toolbar {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(229, 231, 235, 1);
  transition: all 0.2s ease;
  outline: none;
}

.dark .quick-actions-toolbar {
  background: rgba(17, 24, 39, 0.9);
  border-color: rgba(55, 65, 81, 1);
}

.quick-actions-toolbar:focus-within {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.show-on-hover {
  opacity: 0;
  transform: translateY(-4px);
  pointer-events: none;
}

.show-on-hover:hover,
.show-on-hover:focus-within {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.position-top-right {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.position-bottom-left {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
}

.position-floating {
  position: relative;
}

.actions-container {
  display: flex;
  align-items: center;
}

.actions-list {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.action-button {
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
}

.action-button:hover {
  background: rgba(243, 244, 246, 1);
  color: rgba(17, 24, 39, 1);
}

.dark .action-button:hover {
  background: rgba(55, 65, 81, 1);
  color: rgba(243, 244, 246, 1);
}

.action-button.is-active,
.action-button.is-copied,
.action-button.is-pinned {
  background: rgba(59, 130, 246, 1);
  color: white;
}

.action-button.is-negative {
  background: rgba(239, 68, 68, 1);
  color: white;
}

.more-button {
  width: auto;
  padding: 0 0.5rem;
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
}

.action-button:hover .action-tooltip {
  opacity: 1;
}

.expanded-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid rgba(229, 231, 235, 1);
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.dark .expanded-panel {
  background: rgba(17, 24, 39, 1);
  border-color: rgba(55, 65, 81, 1);
}

.expanded-actions {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.expanded-action-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
  text-align: left;
  width: 100%;
}

.expanded-action-button:hover {
  background: rgba(243, 244, 246, 1);
}

.dark .expanded-action-button:hover {
  background: rgba(55, 65, 81, 1);
}

.action-label {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

.action-shortcut {
  font-size: 0.75rem;
  color: rgba(107, 114, 128, 1);
  font-family: monospace;
}

.status-indicators {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 0.5rem;
  pointer-events: none;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: rgba(17, 24, 39, 1);
  color: white;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-indicator.copied {
  background: rgba(34, 197, 94, 1);
}

.status-indicator.feedback {
  background: rgba(59, 130, 246, 1);
}

.status-indicator.pinned {
  background: rgba(251, 146, 60, 1);
}

/* Transitions */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .quick-actions-toolbar {
    position: relative;
    opacity: 1;
    transform: none;
    pointer-events: auto;
    margin: 0.5rem 0;
  }
  
  .expanded-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 300px;
    max-height: 80vh;
    overflow-y: auto;
  }
}
</style>
