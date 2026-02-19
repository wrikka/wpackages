<script setup lang="ts">

import { useFileOpsUi } from '~/composables/fileOpsUi'

const { state, dismissNotification, clearNotifications } = useFileOpsUi()

const notifications = computed(() => state.value.notifications)

function formatTime(ts: number) {
  return new Date(ts).toLocaleString()
}

function badgeClass(level: string) {
  if (level === 'success') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  if (level === 'error') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  if (level === 'warn') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
}

</script>

<template>

  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold">Notifications</h2>
      <button
        class="text-sm px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
        @click="clearNotifications"
      >
        Clear
      </button>
    </div>

    <div v-if="notifications.length === 0" class="text-sm text-gray-500">No notifications.</div>

    <div
      v-for="n in notifications"
      :key="n.id"
      class="p-3 rounded border dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-xs px-2 py-0.5 rounded" :class="badgeClass(n.level)">{{ n.level }}</span>
            <span class="font-semibold truncate">{{ n.title }}</span>
          </div>
          <div v-if="n.message" class="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {{ n.message }}
          </div>
          <div class="text-xs text-gray-500 mt-1">{{ formatTime(n.at) }}</div>
        </div>

        <button class="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100" @click="dismissNotification(n.id)">×</button>
      </div>
    </div>
  </div>

</template>