<script setup lang="ts">

import type { ChatScreenMode } from '#shared/types/common'
import type { ThreadedMessage } from '../composables/chat/useThreadedMessages';
import { formatDate } from '~/utils';

const user = useUser();
import ToolCall from './ToolCall.vue';
import MessageCommentList from './MessageCommentList.vue';
import { usePluginsStore } from '~/stores/plugins';
import PluginFrameHost from './plugins/PluginFrameHost.vue';
import MessageContentRenderer from '../message/MessageContentRenderer.vue'
import MessageFlowAnimation from '../atoms/MessageFlowAnimation.vue'
import QuickActionsToolbar from '../atoms/QuickActionsToolbar.vue'
import MessageStatusIndicator from '../atoms/MessageStatusIndicator.vue'
const emit = defineEmits<{
  'fork': [message: ThreadedMessage],
  'set-active': [messageId: string],
  'start-editing': [message: ThreadedMessage],
  'regenerate': [],
  'apply-to-workspace': [message: ThreadedMessage],
  'pin': [message: ThreadedMessage],
  'feedback': [payload: { messageId: string, type: 'like' | 'dislike' }],
}>();
const props = defineProps<{
  message: ThreadedMessage;
  screenMode: ChatScreenMode;
  codeMode?: boolean;
  isStreaming?: boolean;
}>();
const commentsVisible = ref(false);
const pluginsStore = usePluginsStore();
const toast = useToast();
onMounted(() => {
  pluginsStore.fetchPlugins();
});
const messageActionPlugins = computed(() => {
  return pluginsStore.plugins.filter((p) => {
    const permissions = Array.isArray(p.manifest?.permissions) ? p.manifest.permissions : []
    return p.enabled && permissions.includes('ui:message_actions')
  })
})
const getAllowedMessagePluginMethods = (plugin: any): Array<'setDraft' | 'toast'> => {
  const permissions = Array.isArray(plugin?.manifest?.permissions) ? plugin.manifest.permissions : []
  const allowed: Array<'setDraft' | 'toast'> = []
  if (permissions.includes('ui:message_actions')) {
    allowed.push('toast')
  }
  return allowed
}
const senderName = computed(() => {
  if (props.message.role === 'assistant') {
    return user.value?.aiNickname || 'Assistant';
  }
  return 'You';
});
// Additional methods for QuickActionsToolbar
const handleCopy = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    toast.add({ title: 'Copied to clipboard', timeout: 2000 })
  } catch (error) {
    toast.add({ title: 'Failed to copy', color: 'red' })
  }
}

const handleShare = (messageId: string) => {
  // Implement share functionality
  const shareUrl = `${window.location.origin}/chat/${messageId}`
  navigator.clipboard.writeText(shareUrl)
  toast.add({ title: 'Share link copied to clipboard', timeout: 2000 })
}

const handleTranslate = (content: string) => {
  // Implement translate functionality
  toast.add({ title: 'Translation feature coming soon', timeout: 2000 })
}

const handleExplain = (content: string) => {
  // Implement explain functionality
  toast.add({ title: 'Explanation feature coming soon', timeout: 2000 })
}
function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

</script>

<template>

  <div class="flex" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
    <div
      class="group relative max-w-[80%] rounded-lg px-4 py-2"
      :class="message.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800'"
    >
      <div class="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <QuickActionsToolbar
          :message-id="message.id"
          :content="message.content || ''"
          :role="message.role"
          :is-streaming="props.isStreaming"
          :show-on-hover="true"
          position="top-right"
          @copy="handleCopy"
          @regenerate="emit('regenerate')"
          @feedback="emit('feedback', { messageId: message.id, type: $event })"
          @share="handleShare"
          @edit="emit('start-editing', message)"
          @fork="emit('fork', message)"
          @pin="emit('pin', message)"
          @speak="speak"
          @translate="handleTranslate"
          @explain="handleExplain"
          @apply-to-workspace="emit('apply-to-workspace', message)"
        />
      </div>

      <div class="font-semibold mb-1">{{ senderName }}</div>

      <div v-if="message.role === 'assistant' && message.tool_calls">
        <ToolCall
          v-for="(toolCall, index) in message.tool_calls"
          :key="index"
          :tool-call="toolCall"
          :result="toolCall.id ? message.tool_results?.[toolCall.id] : undefined"
        />
      </div>

      <MessageFlowAnimation 
        :is-streaming="props.isStreaming || message.isStreaming"
        :content="message.content || ''"
        :show-cursor="message.role === 'assistant'"
      >
        <template #default="{ content, isTyping }">
          <MessageContentRenderer 
            :message="{ ...message, content }" 
            :screen-mode="screenMode" 
            :is-typing="isTyping"
          />
        </template>
      </MessageFlowAnimation>
      
      <!-- Message Status Indicator -->
      <MessageStatusIndicator
        v-if="message.status || props.isStreaming"
        :status="message.status || (props.isStreaming ? 'streaming' : 'completed')"
        :message="message.errorMessage"
        :progress="message.progress"
        :show-label="false"
        size="sm"
        position="inline"
        class="mt-2"
      />

      <p class="text-xs opacity-70 mt-1">
        {{ formatDate(timestampToMs(message.timestamp)) }}
      </p>

      <MessageCommentList v-if="commentsVisible" :message-id="message.id" />
    </div>
  </div>

  <div v-if="message.children && message.children.length > 0" class="ml-8 pl-4 border-l-2 border-gray-300 dark:border-gray-700 space-y-4">
    <ChatMessage
      v-for="child in message.children"
      :key="child.id"
      :message="child"
      :screen-mode="screenMode"
      :code-mode="codeMode"
      @fork="emit('fork', $event)"
      @set-active="emit('set-active', $event)"
      @start-editing="emit('start-editing', $event)"
      @regenerate="emit('regenerate')"
      @apply-to-workspace="emit('apply-to-workspace', $event)"
    />
  </div>

</template>