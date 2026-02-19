<script setup lang="ts">


interface User {
  id: string
  name: string
  avatar: string
  status: 'active' | 'idle' | 'typing'
}
interface Cursor {
  userId: string
  userName: string
  color: string
  messagePreview: string
}
interface Activity {
  id: string
  userName: string
  userAvatar: string
  action: string
  timestamp: Date
}
const isLive = ref(true)
const showPresence = ref(true)
const showShareModal = ref(false)
const shareLink = ref('https://aichat.app/share/abc123')
const sharePermission = ref('view')
const allowComments = ref(true)
const permissionOptions = [
  { label: 'Can View', value: 'view' },
  { label: 'Can Comment', value: 'comment' },
  { label: 'Can Edit', value: 'edit' }
]
const activeUsers = ref<User[]>([
  { id: '1', name: 'You', avatar: 'https://i.pravatar.cc/150?u=1', status: 'active' },
  { id: '2', name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=2', status: 'typing' },
  { id: '3', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?u=3', status: 'idle' }
])
const userCursors = ref<Cursor[]>([
  { userId: '2', userName: 'Sarah Chen', color: '#f59e0b', messagePreview: 'Can you explain this more?' },
  { userId: '3', userName: 'Mike Johnson', color: '#10b981', messagePreview: 'Building AI dashboard...' }
])
const recentActivity = ref<Activity[]>([
  { id: '1', userName: 'Sarah Chen', userAvatar: 'https://i.pravatar.cc/150?u=2', action: 'added a comment', timestamp: new Date(Date.now() - 120000) },
  { id: '2', userName: 'Mike Johnson', userAvatar: 'https://i.pravatar.cc/150?u=3', action: 'edited the prompt', timestamp: new Date(Date.now() - 300000) },
  { id: '3', userName: 'You', userAvatar: 'https://i.pravatar.cc/150?u=1', action: 'shared this chat', timestamp: new Date(Date.now() - 600000) }
])
const userStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'bg-green-500',
    idle: 'bg-yellow-500',
    typing: 'bg-blue-500'
  }
  return colors[status] || 'bg-gray-500'
}
const formatTime = (date: Date) => {
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    -Math.floor((Date.now() - date.getTime()) / 60000),
    'minute'
  )
}
const inviteUser = () => {
  showShareModal.value = true
}
const shareChat = () => {
  showShareModal.value = true
}
const togglePresence = () => {
  showPresence.value = !showPresence.value
}
const copyLink = () => {
  navigator.clipboard.writeText(shareLink.value)
}

</script>

<template>

  <div class="collaboration-panel">
    <div class="panel-header">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-heroicons-users" class="text-primary" />
        Real-time Collaboration
      </h3>
      <div class="flex items-center gap-2">
        <UBadge v-if="isLive" color="green" size="sm" class="animate-pulse">● Live</UBadge>
        <span class="text-sm text-gray-500">{{ activeUsers.length }} online</span>
      </div>
    </div>

    <div class="panel-content space-y-4">
      <!-- Active Users -->
      <div class="active-users">
        <p class="text-sm font-medium mb-2">Active Collaborators</p>
        <div class="flex flex-wrap gap-2">
          <UTooltip v-for="user in activeUsers" :key="user.id" :text="user.name">
            <div class="relative">
              <UAvatar :src="user.avatar" :alt="user.name" size="sm" />
              <div
                class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                :class="userStatusColor(user.status)"
              />
            </div>
          </UTooltip>
          <UButton size="xs" color="gray" variant="soft" icon="i-heroicons-plus" @click="inviteUser">
            Invite
          </UButton>
        </div>
      </div>

      <!-- Cursor Positions -->
      <div v-if="userCursors.length > 0" class="cursor-positions">
        <p class="text-sm font-medium mb-2">Currently Viewing</p>
        <div class="space-y-1">
          <div
            v-for="cursor in userCursors"
            :key="cursor.userId"
            class="flex items-center gap-2 text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded"
          >
            <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: cursor.color }" />
            <span class="font-medium" :style="{ color: cursor.color }">{{ cursor.userName }}</span>
            <span class="text-gray-500">is at</span>
            <span class="text-gray-700 dark:text-gray-300">"{{ cursor.messagePreview }}"</span>
          </div>
        </div>
      </div>

      <!-- Recent Edits -->
      <div class="recent-edits">
        <p class="text-sm font-medium mb-2">Recent Activity</p>
        <div class="space-y-2">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="activity-item flex items-start gap-2 text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded"
          >
            <UAvatar :src="activity.userAvatar" size="xs" />
            <div class="flex-1">
              <p>
                <span class="font-medium">{{ activity.userName }}</span>
                <span class="text-gray-500">{{ activity.action }}</span>
              </p>
              <p class="text-xs text-gray-400">{{ formatTime(activity.timestamp) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Collaboration Actions -->
      <div class="collaboration-actions flex gap-2">
        <UButton size="sm" color="primary" variant="soft" icon="i-heroicons-share" @click="shareChat">
          Share Chat
        </UButton>
        <UButton size="sm" color="gray" variant="soft" icon="i-heroicons-eye-slash" @click="togglePresence">
          {{ showPresence ? 'Hide' : 'Show' }} Presence
        </UButton>
      </div>
    </div>

    <!-- Share Modal -->
    <UModal v-model="showShareModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Share Chat</h3>
        
</template>

<style scoped>

.collaboration-panel {
  @apply p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800;
}
.panel-header {
  @apply flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-800;
}

</style>