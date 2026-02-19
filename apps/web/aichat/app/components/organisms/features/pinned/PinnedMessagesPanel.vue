<script setup lang="ts">


interface PinnedMessage {
  id: string
  sender: string
  senderAvatar: string
  content: string
  timestamp: string
  messageId: string
}
const emit = defineEmits<{
  close: []
  jumpTo: [messageId: string]
}>()
const pinnedMessages = ref<PinnedMessage[]>([
  {
    id: '1',
    sender: 'AI Assistant',
    senderAvatar: 'https://i.pravatar.cc/150?u=ai',
    content: 'Here are the key implementation steps:\n\n1. Install the required dependencies\n2. Configure the middleware\n3. Set up authentication routes\n4. Implement session handling',
    timestamp: '2 hours ago',
    messageId: 'msg-123'
  },
  {
    id: '2',
    sender: 'You',
    senderAvatar: 'https://i.pravatar.cc/150?u=1',
    content: 'Important: Remember to add environment variables for production!',
    timestamp: '1 hour ago',
    messageId: 'msg-456'
  }
])
const jumpToMessage = (message: PinnedMessage) => {
  emit('jumpTo', message.messageId)
}
const unpinMessage = (id: string) => {
  pinnedMessages.value = pinnedMessages.value.filter(m => m.id !== id)
}

</script>

<template>

  <div class="pinned-messages-panel">
    <div class="panel-header">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-heroicons-pin" class="text-primary" />
        Pinned Messages
        <UBadge v-if="pinnedMessages.length" size="sm" color="primary">{{ pinnedMessages.length }}</UBadge>
      </h3>
      <UButton size="xs" color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="$emit('close')" />
    </div>

    <div class="panel-content space-y-4">
      <!-- Pinned Messages List -->
      <div v-if="pinnedMessages.length" class="pinned-list space-y-3">
        <div
          v-for="message in pinnedMessages"
          :key="message.id"
          class="pinned-item p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group"
        >
          <div class="flex items-start gap-3">
            <UAvatar :src="message.senderAvatar" size="sm" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="font-medium text-sm">{{ message.sender }}</span>
                <span class="text-xs text-gray-400">{{ message.timestamp }}</span>
              </div>
              <p class="text-sm mt-1 line-clamp-3">{{ message.content }}</p>
              <div class="flex items-center gap-2 mt-2">
                <UButton
                  size="xs"
                  color="gray"
                  variant="soft"
                  icon="i-heroicons-arrow-right"
                  @click="jumpToMessage(message)"
                >
                  Jump to message
                </UButton>
                <UButton
                  size="xs"
                  color="red"
                  variant="ghost"
                  icon="i-heroicons-trash"
                  @click="unpinMessage(message.id)"
                >
                  Unpin
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state text-center py-8">
        <UIcon name="i-heroicons-pin" class="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p class="text-gray-500">No pinned messages yet</p>
        <p class="text-sm text-gray-400 mt-1">Pin important messages to find them easily</p>
      </div>

      <!-- Pin Info -->
      <div v-if="pinnedMessages.length" class="pin-info p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div class="flex items-start gap-2">
          <UIcon name="i-heroicons-information-circle" class="text-blue-500 w-5 h-5 mt-0.5" />
          <div>
            <p class="text-sm text-blue-700 dark:text-blue-300">
              Pinned messages are visible to all chat participants
            </p>
            <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Maximum 50 pinned messages per chat
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>

.pinned-messages-panel {
  @apply p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800;
}
.panel-header {
  @apply flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-800;
}

</style>