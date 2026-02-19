<script setup lang="ts">

import { useFileOpsUi } from '~/composables/fileOpsUi'

const { state, addHistory, selectJob } = useFileOpsUi()

const history = computed(() => state.value.history)

function formatTime(ts: number) {
  return new Date(ts).toLocaleString()
}

function badgeClass(level: string) {
  if (level === 'error') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  if (level === 'warn') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
}

function addSampleEvent() {
  addHistory('info', `Sample event at ${new Date().toLocaleTimeString()}`)
}

function goToJob(jobId: string) {
  selectJob(jobId)
  navigateTo('/jobs')
}

</script>

<template>

  <div class="p-4">
    <div class="flex items-start justify-between mb-4">
      <div>
        <h1 class="text-3xl font-bold">History</h1>
        <p class="text-sm text-gray-500">UI-only mock audit trail for file-ops jobs.</p>
      </div>

      <button
        class="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
        @click="addSampleEvent"
      >
        Add sample event
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div v-if="history.length === 0" class="text-sm text-gray-500">No events.</div>

      <div v-else class="space-y-2">
        <div
          v-for="e in history"
          :key="e.id"
          class="p-3 rounded border dark:border-gray-700"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs px-2 py-0.5 rounded" :class="badgeClass(e.level)">{{ e.level }}</span>
              <span class="font-semibold">{{ e.message }}</span>
              <button
                v-if="e.jobId"
                class="text-xs text-blue-500 hover:underline"
                @click="goToJob(e.jobId)"
              >
                View job
              </button>
            </div>
            <div class="text-xs text-gray-500">{{ formatTime(e.at) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>