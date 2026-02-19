<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'

// Import chatinput module
import { useChatInputState, useChatInputEditor, useChatInputFeatures } from './composables'
import type { ChatInputProps, ChatInputEmits } from './types'

// Import app-specific composables from module
import { useLiveblocksCollaboration } from './composables/useLiveblocksCollaboration'
import { usePluginSystem } from './composables/usePluginSystem'
import { useChatMode } from './composables/useChatMode'
import { useChatMenu } from './composables/useChatMenu'
import { useChatForms } from './composables/useChatForms'
import { useCodeMirrorExtensions } from './composables/useCodeMirrorExtensions'
import { useCodeRefactor } from './composables/useCodeRefactor'

// Import sub-components
import PluginToolbar from './components/PluginToolbar.vue'
import ModeHelper from './components/ModeHelper.vue'
import FileAttachments from './components/FileAttachments.vue'
import ContextSuggestions from './components/ContextSuggestions.vue'
import MenuOverlay from './components/MenuOverlay.vue'
import ActionButtons from './components/ActionButtons.vue'
import PluginHooks from './components/PluginHooks.vue'
import TypingIndicator from './components/TypingIndicator.vue'

// Import stores
import { useTemplatesStore } from '../stores/templates'
import { usePromptsStore } from '../stores/prompts'
import { useContentGenerationStore } from '../stores/contentGeneration'
import { useOrganization } from '~/app/composables/organization'

// Props & Emits
const props = defineProps<ChatInputProps>()
const emit = defineEmits<ChatInputEmits>()

// Initialize chatinput composables
const {
  message,
  isLoading,
  isDisabled,
  files,
  handleFileChange,
  removeFile,
  handleSend: handleSendBase,
  handleStop,
} = useChatInputState(props, emit)

const {
  view,
  handleReady,
  onEditorUpdate,
} = useChatInputEditor(message)

const {
  editorHeight,
  showTypingIndicator,
  contextSuggestions,
  updateEditorHeight,
  handleTypingIndicator,
  fetchContextSuggestions,
  applySuggestion: applySuggestionBase,
} = useChatInputFeatures(message)

// Initialize app composables
const { getExtensions: getLiveblocksExtensions } = useLiveblocksCollaboration(message)
const { 
  chatInputToolbarPlugins, 
  beforeSendPlugins, 
  setBeforeSendHostRef, 
  getAllowedPluginMethods 
} = usePluginSystem()

const {
  selectedModel,
  selectedModeId,
  effectiveMode,
  effectiveSystemPrompt,
  modeUx,
  selectedModeConfig,
} = useChatMode(props.mode, props.model)

const {
  isMenuOpen,
  menuType,
  filteredMenuItems,
  openMenu,
  closeMenu,
} = useChatMenu()

const {
  modeHelperOpen,
} = useChatForms()

const { smartPasteExtension } = useCodeMirrorExtensions()

// Stores
const templatesStore = useTemplatesStore()
const promptsStore = usePromptsStore()
const toast = useToast()

// CodeMirror extensions
const finalExtensions = computed(() => [
  javascript(),
  oneDark,
  smartPasteExtension,
  EditorView.updateListener.of(onEditorUpdate),
  ...getLiveblocksExtensions([])
])

// Watchers
watch(() => props.value, (newValue) => {
  if (newValue !== message.value) {
    message.value = newValue
  }
})

watch(message, (newValue) => {
  emit('update:value', newValue)
})

watch(selectedModel, (newValue) => {
  emit('update:model', newValue)
})

watch(selectedModeId, (newValue) => {
  emit('update:mode', newValue)
})

// Lifecycle
onMounted(() => {
  templatesStore.fetchTemplates()
  promptsStore.fetchPrompts()
})

// Methods
const syncMenuFromCursor = () => {
  const cursorPos = view.value?.state.selection.main.head || 0
  const textBeforeCursor = message.value.slice(0, cursorPos)
  
  if (textBeforeCursor.endsWith('@')) {
    openMenu('mention', '@')
  } else if (textBeforeCursor.endsWith('/')) {
    openMenu('command', '/')
  } else if (textBeforeCursor.endsWith('#')) {
    openMenu('template', '#')
  } else {
    closeMenu()
  }
}

const handleFileSelect = () => {
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.multiple = true
  fileInput.onchange = handleFileChange
  fileInput.click()
}

const handleSend = async () => {
  await handleSendBase(effectiveMode.value, selectedModel.value, effectiveSystemPrompt.value)
}

const insertMenuItem = (item: any) => {
  const insertText = item.insert
  const cursorPos = view.value?.state.selection.main.head || message.value.length
  const newMessage = message.value.slice(0, cursorPos) + insertText + message.value.slice(cursorPos)
  message.value = newMessage
  closeMenu()
  view.value?.focus()
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

const applySuggestion = (suggestion: any) => {
  applySuggestionBase(suggestion, message, view)
}
</script>

<template>
  <div class="chat-input-container">
    <!-- Plugin Toolbar -->
    <PluginToolbar
      :plugins="chatInputToolbarPlugins"
      :on-toast="toast.add"
    />

    <!-- Mode Helper -->
    <ModeHelper
      :is-open="modeHelperOpen"
      :mode-config="selectedModeConfig"
      :mode-ux="modeUx"
      :on-close="() => modeHelperOpen = false"
    />

    <!-- File Attachments -->
    <FileAttachments
      :files="files"
      :on-remove-file="removeFile"
    />

    <!-- Main Input Area -->
    <div class="input-area relative">
      <div class="smart-editor-wrapper">
        <Codemirror
          v-model="message"
          :extensions="finalExtensions"
          :disabled="isDisabled"
          :placeholder="modeUx.placeholder"
          @ready="handleReady"
          @keydown="handleKeyDown"
          @update="onEditorUpdate"
          class="smart-editor min-h-[60px] max-h-[400px] transition-all duration-200"
          :style="{ height: editorHeight + 'px' }"
        />
        
        <!-- Context Suggestions -->
        <ContextSuggestions
          :suggestions="contextSuggestions"
          :on-apply-suggestion="applySuggestion"
        />
        
        <!-- Typing Indicator -->
        <TypingIndicator :show="showTypingIndicator" />
      </div>

      <!-- Menu Overlay -->
      <MenuOverlay
        :is-open="isMenuOpen"
        :menu-type="menuType"
        :items="filteredMenuItems"
        :on-select-item="insertMenuItem"
      />
    </div>

    <!-- Action Buttons -->
    <ActionButtons
      :is-loading="isLoading"
      :is-disabled="isDisabled"
      :message="message"
      :selected-mode-id="selectedModeId"
      :selected-model="selectedModel"
      :enabled-modes="enabledModes"
      :available-models="availableModels"
      :on-file-select="handleFileSelect"
      :on-open-command-menu="() => openMenu('command', '/')"
      :on-stop="handleStop"
      :on-send="handleSend"
    />

    <!-- Plugin Hooks -->
    <PluginHooks
      :plugins="beforeSendPlugins"
      :on-set-draft="(draft: any) => message = draft"
      :on-toast="toast.add"
    />
  </div>
</template>

<style scoped>
.chat-input-container {
  border: 1px solid;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: white;
}

.dark .chat-input-container {
  background-color: rgb(17 24 39);
}

.smart-editor-wrapper {
  position: relative;
}

.smart-editor {
  width: 100%;
  resize: none;
  border: none;
  outline: none;
}
</style>
