<script setup lang="ts">

import type { ChatMode, ChatScreenMode } from '#shared/types/common'
import {

  useChat,
  useChatUIStore,
  useKeyboardShortcuts,
  useMessageEditing,
  useSessionsStore,
} from '#imports'
import { useThreadedMessages } from '../composables/chat/useThreadedMessages';
import { useMessagePinning } from '../composables/chat/useMessagePinning'
import ChatMessageList from '../organisms/ChatMessageList.vue';
import ChatInput from '../../aichatinput/components/ChatInput.vue';
type Props = {
  initialMode: ChatScreenMode
}
const props = defineProps<Props>()
const sessionsStore = useSessionsStore()
const chatUIStore = useChatUIStore()
import ExamplePrompts from '../organisms/ExamplePrompts.vue';
const { sendMessage, regenerateResponse, editAndResend, stopGenerating } = useChat()
const { togglePin } = useMessagePinning()
const { editingMessage, editingContent, startEditing, cancelEditing } = useMessageEditing()
const chatInputRef = ref()
const chatInputValue = ref('')
const chatInputMode = ref<string>(props.initialMode)
async function handleSend(payload: { message: string, files: File[], mode: ChatMode, model: string, systemPrompt?: string | null }) {
  await sendMessage(payload.message, {
    files: payload.files,
    mode: payload.mode,
    model: payload.model,
    systemPrompt: payload.systemPrompt ?? undefined,
  })
}
const messages = computed(() => sessionsStore.currentSession?.messages || []);
const { threadedMessages } = useThreadedMessages(messages);
function handlePromptSelect(prompt: string) {
  chatInputValue.value = prompt;
  chatInputRef.value?.focus?.();
}
// Keyboard shortcuts
useKeyboardShortcuts([
  {
    key: '/',
    ctrlKey: true,
    handler: () => {
      chatInputRef.value?.focus?.()
    },
    description: 'Focus input',
  },
])
const latestChatError = computed(() => {
  return null
})
defineExpose({
  chatInputRef,
})

</script>

<template>

  <div class="chat-main">
    <!-- Messages area -->
    <div class="messages-container">
            <ExamplePrompts v-if="messages.length === 0" @select="handlePromptSelect" />
      <ChatMessageList
        v-else
        :messages="threadedMessages"
        :screen-mode="props.initialMode"
        :is-loading="chatUIStore.isLoading"
        :is-typing="chatUIStore.isTyping"
        :editing-message="editingMessage"
        :editing-content="editingContent"
        @start-editing="startEditing"
        @cancel-editing="cancelEditing"
        @edit-and-resend="editAndResend"
        @regenerate-response="regenerateResponse"
        @stop-generating="stopGenerating"
        @pin="togglePin"
      />
    </div>

    <!-- Input area -->
    <div class="input-container">
            <ChatInput
        ref="chatInputRef"
        v-model:value="chatInputValue"
        v-model:mode="chatInputMode"
        :disabled="chatUIStore.isLoading"
        @send="handleSend"
        @stop="stopGenerating"
      />
    </div>
  </div>

</template>

<style scoped>

.chat-main {
  @apply flex flex-col h-full;
}

.messages-container {
  @apply flex-1 overflow-y-auto p-4;
}

.error-section {
  @apply p-4 border-t border-gray-200 dark:border-gray-700;
}

.input-container {
  @apply p-4 border-t border-gray-200 dark:border-gray-700;
}

</style>