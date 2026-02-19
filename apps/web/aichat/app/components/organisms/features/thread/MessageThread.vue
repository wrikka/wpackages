<script setup lang="ts">


interface Message {
  id: string
  sender: string
  senderAvatar: string
  content: string
  timestamp: string
  isEdited?: boolean
  reactions: number
  isCurrentUser?: boolean
}
const emit = defineEmits<{
  close: []
}>()
const showEmojiPicker = ref(false)
const replyContent = ref('')
const parentMessage = ref({
  id: 'parent-1',
  sender: 'Sarah Chen',
  senderAvatar: 'https://i.pravatar.cc/150?u=2',
  content: 'What do you all think about implementing this with a queue system instead?',
  timestamp: '2 hours ago'
})
const threadReplies = ref<Message[]>([
  {
    id: '1',
    sender: 'Mike Johnson',
    senderAvatar: 'https://i.pravatar.cc/150?u=3',
    content: 'Great idea! A queue would handle the async processing much better.',
    timestamp: '1 hour ago',
    reactions: 2,
    isCurrentUser: false
  },
  {
    id: '2',
    sender: 'Alex Kim',
    senderAvatar: 'https://i.pravatar.cc/150?u=4',
    content: 'I agree. We could use Redis for the queue implementation.',
    timestamp: '45 min ago',
    reactions: 1,
    isCurrentUser: false
  },
  {
    id: '3',
    sender: 'You',
    senderAvatar: 'https://i.pravatar.cc/150?u=1',
    content: 'Redis is a good choice. We should also consider error handling for failed jobs.',
    timestamp: '30 min ago',
    reactions: 3,
    isCurrentUser: true
  }
])
const threadParticipants = computed(() => {
  const unique = new Set(threadReplies.value.map(r => r.senderAvatar))
  return Array.from(unique).map(avatar => ({ src: avatar }))
})
const sendReply = () => {
  if (!replyContent.value.trim()) return
  threadReplies.value.push({
    id: Date.now().toString(),
    sender: 'You',
    senderAvatar: 'https://i.pravatar.cc/150?u=1',
    content: replyContent.value,
    timestamp: 'Just now',
    reactions: 0,
    isCurrentUser: true
  })
  replyContent.value = ''
}
const reactToReply = (replyId: string) => {
  const reply = threadReplies.value.find(r => r.id === replyId)
  if (reply) reply.reactions++
}
const replyToReply = (reply: Message) => {
  replyContent.value = `@${reply.sender} `
}
const shareThread = () => {
  // Share thread logic
}

</script>

<template>

  <div class="message-thread">
    <!-- Thread Header -->
    <div class="thread-header flex items-center gap-3 p-3 border-b border-gray-200 dark:border-gray-800">
      <UButton size="xs" color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="$emit('close')" />
      <div class="flex-1">
        <p class="font-medium">Thread</p>
        <p class="text-xs text-gray-500">{{ threadReplies.length }} replies</p>
      </div>
      <div class="flex items-center gap-1">
        <UAvatarGroup :users="threadParticipants" size="xs" :max="3" />
      </div>
    </div>

    <!-- Parent Message -->
    <div class="parent-message p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
      <div class="flex items-start gap-3">
        <UAvatar :src="parentMessage.senderAvatar" size="sm" />
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span class="font-medium text-sm">{{ parentMessage.sender }}</span>
            <span class="text-xs text-gray-500">{{ parentMessage.timestamp }}</span>
          </div>
          <p class="text-sm mt-1">{{ parentMessage.content }}</p>
          <div class="flex items-center gap-2 mt-2">
            <UButton size="xs" color="gray" variant="ghost" icon="i-heroicons-emoji-happy" @click="showEmojiPicker = true" />
            <UButton size="xs" color="gray" variant="ghost" icon="i-heroicons-share" @click="shareThread" />
          </div>
        </div>
      </div>
    </div>

    <!-- Replies -->
    <div class="thread-replies flex-1 overflow-y-auto p-4 space-y-4">
      <div
        v-for="reply in threadReplies"
        :key="reply.id"
        class="reply-item"
        :class="reply.isCurrentUser ? 'ml-8' : ''"
      >
        <div class="flex items-start gap-3">
          <UAvatar :src="reply.senderAvatar" size="sm" />
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="font-medium text-sm" :class="reply.isCurrentUser ? 'text-primary' : ''">
                {{ reply.sender }}
              </span>
              <span class="text-xs text-gray-500">{{ reply.timestamp }}</span>
              <span v-if="reply.isEdited" class="text-xs text-gray-400">(edited)</span>
            </div>
            <p class="text-sm mt-1">{{ reply.content }}</p>
            <div class="flex items-center gap-2 mt-1">
              <button class="text-xs text-gray-500 hover:text-primary flex items-center gap-1" @click="reactToReply(reply.id)">
                <UIcon name="i-heroicons-hand-thumb-up" class="w-4 h-4" />
                {{ reply.reactions > 0 ? reply.reactions : '' }}
              </button>
              <button class="text-xs text-gray-500 hover:text-primary" @click="replyToReply(reply)">Reply</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Thread Input -->
    <div class="thread-input p-3 border-t border-gray-200 dark:border-gray-800">
      <div class="flex items-end gap-2">
        <UTextarea
          v-model="replyContent"
          :rows="1"
          :autoresize="true"
          placeholder="Reply in thread..."
          class="flex-1"
          @keydown.enter.prevent="sendReply"
        />
        <UButton color="primary" icon="i-heroicons-paper-airplane" :disabled="!replyContent.trim()" @click="sendReply" />
      </div>
    </div>
  </div>

</template>

<style scoped>

.message-thread {
  @apply flex flex-col h-full bg-white dark:bg-gray-900;
}
.thread-header {
  @apply shrink-0;
}
.thread-replies {
  @apply flex-1;
}

</style>