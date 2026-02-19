<template>
  <div 
    class="quick-actions-toolbar"
    :class="[
      `position-${position}`,
      { 'show-on-hover': showOnHover },
      { 'is-expanded': isExpanded }
    ]"
  >
    <!-- Primary Actions -->
    <div class="actions-container">
      <div class="actions-list">
        <QuickActionButton
          v-for="action in visibleActions"
          :key="action.id"
          :action="action"
          :is-expanded="isExpanded"
          :is-active="action.id === 'copy' && copiedText"
          :is-copied="action.id === 'copy' && copiedText"
          :is-pinned="action.id === 'pin' && isPinned"
        />
        
        <!-- More Actions Button -->
        <button
          v-if="hasMoreActions"
          class="more-button"
          :class="{ 'is-active': isExpanded }"
          title="More actions"
          @click="toggleExpanded"
        >
          <UIcon 
            :name="isExpanded ? 'i-heroicons-x-mark-20-solid' : 'i-heroicons-ellipsis-horizontal'" 
            class="w-4 h-4" 
          />
        </button>
      </div>
    </div>

    <!-- Expanded Actions Panel -->
    <Transition name="expand">
      <div v-if="isExpanded" class="expanded-panel">
        <div class="expanded-actions">
          <button
            v-for="action in moreActions"
            :key="action.id"
            class="expanded-action-button"
            @click="executeAction(action)"
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

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { QuickAction } from '~/types/quick-actions'
import { useQuickActions } from '~/composables/ui/useQuickActions'
import QuickActionButton from '../atoms/QuickActionButton.vue'

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

// Composables
const {
  createCopyAction,
  createRegenerateAction,
  createFeedbackAction,
  createShareAction,
  createEditAction,
  createForkAction,
  createPinAction,
  createSpeakAction,
  createTranslateAction,
  createExplainAction,
  createApplyToWorkspaceAction
} = useQuickActions()

// Computed
const availableActions = computed(() => {
  const actions = [
    createCopyAction(props.content, (content: string) => handleCopy(content)),
    createRegenerateAction(() => emit('regenerate')),
    createFeedbackAction('like', feedbackGiven.value, (type: 'like' | 'dislike') => handleFeedback(type)),
    createFeedbackAction('dislike', feedbackGiven.value, (type: 'like' | 'dislike') => handleFeedback(type)),
    createShareAction(props.messageId, (messageId: string) => emit('share', messageId)),
    createEditAction(props.messageId, (messageId: string) => emit('edit', messageId)),
    createForkAction(props.messageId, (messageId: string) => emit('fork', messageId)),
    createPinAction(isPinned.value, (messageId: string) => emit('pin', messageId)),
    createSpeakAction(props.content, (content: string) => emit('speak', content)),
    createTranslateAction(props.content, (content: string) => emit('translate', content)),
    createExplainAction(props.content, (content: string) => emit('explain', content)),
    createApplyToWorkspaceAction(props.content, (content: string) => emit('apply-to-workspace', content))
  ]
  
  // Filter actions based on role
  return actions.filter(action => {
    if (action.alwaysVisible) return true
    
    // Role-specific visibility
    if (action.id === 'regenerate' || action.id === 'like' || action.id === 'dislike') {
      return props.role === 'assistant'
    }
    if (action.id === 'edit') {
      return props.role === 'user'
    }
    
    return true
  })
})

const visibleActions = computed(() => {
  return availableActions.value.slice(0, 4)
})

const moreActions = computed(() => {
  return availableActions.value.slice(4)
})

const hasMoreActions = computed(() => {
  return availableActions.value.length > 4
})

// Methods
const executeAction = (action: QuickAction) => {
  action.handler()
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const handleCopy = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    copiedText.value = true
    emit('copy', content)
    
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
</script>

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

.more-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  padding: 0 0.5rem;
  border: none;
  background: transparent;
  color: rgba(107, 114, 128, 1);
  cursor: pointer;
  transition: all 0.15s ease;
  border-radius: 0.375rem;
}

.more-button:hover {
  background: rgba(243, 244, 246, 1);
  color: rgba(17, 24, 39, 1);
}

.dark .more-button:hover {
  background: rgba(55, 65, 81, 1);
  color: rgba(243, 244, 246, 1);
}

.more-button.is-active {
  background: rgba(59, 130, 246, 1);
  color: white;
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
  min-width: 200px;
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
  color: rgba(17, 24, 39, 1);
}

.dark .action-label {
  color: rgba(243, 244, 246, 1);
}

.action-shortcut {
  font-size: 0.75rem;
  color: rgba(107, 114, 128, 1);
  font-family: monospace;
  background: rgba(243, 244, 246, 1);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.dark .action-shortcut {
  background: rgba(55, 65, 81, 1);
  color: rgba(156, 163, 175, 1);
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

/* Responsive */
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
