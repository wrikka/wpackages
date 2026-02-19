<script setup lang="ts">

import NotificationCenter from '~/components/NotificationCenter.vue'
import { useFileOpsUi } from '~/composables/fileOpsUi'

const { createJob, start, addHistory, notify } = useFileOpsUi()

const watchPath = ref('./')
const events = ref<string[]>([])

function queueWatch() {
  const job = createJob({
    type: 'watch',
    title: `Watch: ${watchPath.value}`,
    input: { path: watchPath.value },
  })
  start(job.id)
  notify('success', 'Watcher started (mock)', watchPath.value)
}

function emitMockEvent() {
  const line = `[${new Date().toISOString()}] change ${watchPath.value}/file_${Math.floor(Math.random() * 100)}.txt`
  events.value.unshift(line)
  addHistory('info', `Watcher event: ${line}`)
}

</script>

<template>

  <div class="p-4">
    <h1 class="text-3xl font-bold mb-2">Watcher</h1>
    <p class="text-sm text-gray-500 mb-6">UI-only mock for file system watch + event stream.</p>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 class="text-lg font-bold mb-3">Create watch job</h2>

        <div class="space-y-3">
          <div>
            <label class="text-sm font-semibold">Path</label>
            <input v-model="watchPath" class="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600" placeholder="./" />
          </div>

          <div class="flex items-center gap-2">
            <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" @click="queueWatch">
              Start watching
            </button>
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600" @click="emitMockEvent">
              Emit mock event
            </button>
          </div>
        </div>
      </div>

      <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 class="text-lg font-bold mb-3">Event Stream (mock)</h2>
        <div class="h-96 bg-black text-white rounded p-3 overflow-auto font-mono text-xs">
          <pre v-if="events.length">{{ events.join('\n') }}</pre>
          <div v-else class="text-gray-400">No events.</div>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <NotificationCenter />
    </div>
  </div>

</template>