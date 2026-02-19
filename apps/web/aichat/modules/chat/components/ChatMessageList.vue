<script setup lang="ts">

import type { ThreadedMessage } from '../composables/chat/useThreadedMessages';
import type { ChatScreenMode } from '#shared/types/common'
import ChatMessage from '../molecules/ChatMessage.vue';
import { useMessageFeedback } from '~/app/composables/chat/useMessageFeedback';

const emit = defineEmits<{
  'fork': [message: ThreadedMessage],
  'set-active': [messageId: string],
  'start-editing': [message: ThreadedMessage],
  'regenerate': [],
  'apply-to-workspace': [message: ThreadedMessage],
  'pin': [message: ThreadedMessage],
  'feedback': [payload: { messageId: string, type: 'like' | 'dislike' }],
}>();
const { sendFeedback } = useMessageFeedback();
defineProps<{
  messages: ThreadedMessage[];
  screenMode: ChatScreenMode;
  codeMode?: boolean;
  isTyping?: boolean;
}>();

</script>

<template>

  <div class="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
    <ChatMessage
      v-for="message in messages"
      :key="message.id"
      :message="message"
      :screen-mode="screenMode"
      :code-mode="codeMode"
      @fork="emit('fork', $event)"
      @set-active="emit('set-active', $event)"
      @start-editing="emit('start-editing', $event)"
      @regenerate="emit('regenerate')"
      @apply-to-workspace="emit('apply-to-workspace', $event)"
      @pin="emit('pin', $event)"
      @feedback="sendFeedback"
    />
    <div v-if="isTyping" class="flex justify-start">
      <div class="max-w-[80%] rounded-lg px-4 py-2 bg-gray-200 text-gray-800">
        <span class="animate-pulse">...</span>
      </div>
    </div>
  </div>

</template>