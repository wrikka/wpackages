<script setup lang="ts">


interface Notification {
  id: string
  type: 'mention' | 'reply' | 'system' | 'agent' | 'collaboration'
  priority: 'high' | 'medium' | 'low'
  title: string
  message: string
  read: boolean
  timestamp: Date
  action?: string
}
const isOpen = ref(false)
const showSettings = ref(false)
const activeFilter = ref('all')
const settings = ref({
  smartNotifications: true,
  emailNotifications: false,
  pushNotifications: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00'
})
const priorityFilters = [
  { label: 'All', value: 'all', count: 0 },
  { label: 'High', value: 'high', count: 2 },
  { label: 'Medium', value: 'medium', count: 3 },
  { label: 'Low', value: 'low', count: 1 }
]
const notifications = ref<Notification[]>([
  { id: '1', type: 'mention', priority: 'high', title: 'Sarah mentioned you', message: 'Sarah Chen mentioned you in "Project Planning"', read: false, timestamp: new Date(Date.now() - 300000), action: 'View' },
  { id: '2', type: 'reply', priority: 'high', title: 'New reply to your message', message: 'Mike Johnson replied to your question about API design', read: false, timestamp: new Date(Date.now() - 600000), action: 'View' },
  { id: '3', type: 'agent', priority: 'medium', title: 'Agent completed task', message: 'Code Reviewer Pro finished analyzing your repository', read: true, timestamp: new Date(Date.now() - 1800000) },
  { id: '4', type: 'system', priority: 'medium', title: 'Weekly summary ready', message: 'Your weekly AI usage summary is now available', read: true, timestamp: new Date(Date.now() - 86400000), action: 'View' },
  { id: '5', type: 'collaboration', priority: 'medium', title: 'New collaborator', message: 'Alex Kim joined your shared chat', read: true, timestamp: new Date(Date.now() - 1200000) },
  { id: '6', type: 'system', priority: 'low', title: 'Feature update', message: 'New keyboard shortcuts are now available', read: true, timestamp: new Date(Date.now() - 172800000) }
])
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
const filteredNotifications = computed(() => {
  if (activeFilter.value === 'all') return notifications.value
  return notifications.value.filter(n => n.priority === activeFilter.value)
})
const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    mention: 'i-heroicons-at-symbol',
    reply: 'i-heroicons-chat-bubble-left-right',
    system: 'i-heroicons-cog-6-tooth',
    agent: 'i-heroicons-robot',
    collaboration: 'i-heroicons-users'
  }
  return icons[type] || 'i-heroicons-bell'
}
const getIconBgColor = (type: string) => {
  const colors: Record<string, string> = {
    mention: 'bg-purple-100 text-purple-600',
    reply: 'bg-blue-100 text-blue-600',
    system: 'bg-gray-100 text-gray-600',
    agent: 'bg-green-100 text-green-600',
    collaboration: 'bg-orange-100 text-orange-600'
  }
  return colors[type] || 'bg-gray-100 text-gray-600'
}
const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    high: 'border-l-4 border-red-500',
    medium: 'border-l-4 border-yellow-500',
    low: 'border-l-4 border-gray-300'
  }
  return colors[priority] || ''
}
const formatTime = (date: Date) => {
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}
const openNotification = (notification: Notification) => {
  notification.read = true
}
const markAllRead = () => {
  notifications.value.forEach(n => n.read = true)
}

</script>

<template>

  <div class="notification-center">
    <UButton color="gray" variant="ghost" class="relative" @click="isOpen = true">
      <UIcon name="i-heroicons-bell" class="w-5 h-5" />
      <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </UButton>

    <USlideover v-model="isOpen" :ui="{ width: 'md' }">
      <div class="p-4 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Notifications</h3>
          <div class="flex items-center gap-2">
            <UButton size="xs" color="gray" variant="ghost" @click="markAllRead">Mark all read</UButton>
            <UButton color="gray" variant="ghost" icon="i-heroicons-cog-6-tooth" size="xs" @click="showSettings = true" />
          </div>
        </div>

        <!-- Smart Priorities -->
        <div class="priority-filters flex gap-2">
          <UButton
            v-for="filter in priorityFilters"
            :key="filter.value"
            size="xs"
            :color="activeFilter === filter.value ? 'primary' : 'gray'"
            variant="soft"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
            <UBadge v-if="filter.count > 0" size="xs" color="red" class="ml-1">{{ filter.count }}</UBadge>
          </UButton>
        </div>

        <!-- Notifications List -->
        <div class="notifications-list space-y-2 max-h-[60vh] overflow-y-auto">
          <div
            v-for="notification in filteredNotifications"
            :key="notification.id"
            class="notification-item p-3 rounded-lg cursor-pointer transition-colors"
            :class="[
              notification.read ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-blue-50 dark:bg-blue-900/20',
              getPriorityColor(notification.priority)
            ]"
            @click="openNotification(notification)"
          >
            <div class="flex items-start gap-3">
              <div class="notification-icon p-2 rounded-lg" :class="getIconBgColor(notification.type)">
                <UIcon :name="getNotificationIcon(notification.type)" class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <p class="font-medium text-sm truncate" :class="!notification.read && 'text-blue-700 dark:text-blue-300'">
                    {{ notification.title }}
                  </p>
                  <span class="text-xs text-gray-500 whitespace-nowrap">{{ formatTime(notification.timestamp) }}</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{{ notification.message }}</p>
                <div v-if="notification.action" class="mt-2">
                  <UButton size="xs" color="primary" variant="soft">{{ notification.action }}</UButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredNotifications.length === 0" class="text-center py-8 text-gray-500">
          <UIcon name="i-heroicons-inbox" class="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No notifications</p>
        </div>
      </div>
    </USlideover>

    <!-- Settings Modal -->
    <UModal v-model="showSettings">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Notification Settings</h3>
        
</template>

<style scoped>

.notification-center {
  @apply relative;
}
.notification-item {
  @apply hover:bg-gray-100 dark:hover:bg-gray-800;
}

</style>