<script setup lang="ts">

import type { FileOpsJob, FileOpsJobStatus } from '~/composables/fileOpsUi'

defineEmits<{
  create: []
  refresh: []
  select: [jobId: string]
  start: [jobId: string]
  pause: [jobId: string]
  resume: [jobId: string]
  retry: [jobId: string]
  cancel: [jobId: string]
}>()

defineProps<{ jobs: FileOpsJob[] }>()

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString()
}

function statusClass(status: FileOpsJobStatus) {
  if (status === 'succeeded') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  if (status === 'failed') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  if (status === 'paused') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  if (status === 'running') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  if (status === 'cancelled') return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
}

</script>

<template>

  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold">Jobs</h2>
      <div class="flex gap-2">
        <button
          class="text-sm px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
          @click="$emit('create')"
        >
          New Job
        </button>
        <button
          class="text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          @click="$emit('refresh')"
        >
          Refresh
        </button>
      </div>
    </div>

    <div class="overflow-auto rounded border dark:border-gray-700">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="text-left px-3 py-2">Title</th>
            <th class="text-left px-3 py-2">Type</th>
            <th class="text-left px-3 py-2">Status</th>
            <th class="text-right px-3 py-2">Progress</th>
            <th class="text-right px-3 py-2">Updated</th>
            <th class="text-right px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="j in jobs"
            :key="j.id"
            class="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
            @click="$emit('select', j.id)"
          >
            <td class="px-3 py-2 max-w-[420px] truncate">{{ j.title }}</td>
            <td class="px-3 py-2">{{ j.type }}</td>
            <td class="px-3 py-2">
              <span class="text-xs px-2 py-0.5 rounded" :class="statusClass(j.status)">{{ j.status }}</span>
            </td>
            <td class="px-3 py-2 text-right tabular-nums">{{ j.progress.percent }}%</td>
            <td class="px-3 py-2 text-right">{{ formatTime(j.updatedAt) }}</td>
            <td class="px-3 py-2 text-right">
              <div class="flex justify-end gap-1" @click.stop>
                <button
                  class="text-xs px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                  @click="$emit('start', j.id)"
                >
                  Start
                </button>
                <button
                  class="text-xs px-2 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                  @click="$emit('pause', j.id)"
                >
                  Pause
                </button>
                <button
                  class="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                  @click="$emit('resume', j.id)"
                >
                  Resume
                </button>
                <button
                  class="text-xs px-2 py-1 rounded bg-gray-600 text-white hover:bg-gray-700"
                  @click="$emit('retry', j.id)"
                >
                  Retry
                </button>
                <button
                  class="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                  @click="$emit('cancel', j.id)"
                >
                  Cancel
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="jobs.length === 0">
            <td colspan="6" class="px-3 py-6 text-center text-gray-500">No jobs.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

</template>