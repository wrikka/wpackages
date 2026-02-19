<script setup lang="ts">

import NotificationCenter from '~/components/NotificationCenter.vue'
import { useFileOpsUi } from '~/composables/fileOpsUi'

const { createJob, start, notify } = useFileOpsUi()

const path = ref('./file.bin')
const algo = ref<'sha256' | 'blake3'>('sha256')

const expected = ref('')
const actual = ref('')
const result = ref<{ ok: boolean; message: string } | null>(null)

function createChecksumJob() {
  const job = createJob({
    type: 'checksum',
    title: `Checksum: ${path.value} (${algo.value})`,
    input: { path: path.value, algo: algo.value },
  })
  start(job.id)
}

function mockFillActual() {
  actual.value = expected.value || Math.random().toString(16).slice(2).padEnd(64, '0')
  notify('info', 'Mock actual filled')
}

function compareNow() {
  const ok = expected.value.length > 0 && expected.value === actual.value
  result.value = ok
    ? { ok: true, message: 'Checksum match.' }
    : { ok: false, message: 'Checksum mismatch.' }
}

</script>

<template>

  <div class="p-4">
    <h1 class="text-3xl font-bold mb-2">Checksums</h1>
    <p class="text-sm text-gray-500 mb-6">UI-only mock for checksum/verification workflows.</p>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 class="text-lg font-bold mb-3">Create checksum job</h2>

        <div class="space-y-3">
          <div>
            <label class="text-sm font-semibold">Path</label>
            <input v-model="path" class="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600" placeholder="./file.bin" />
          </div>
          <div>
            <label class="text-sm font-semibold">Algorithm</label>
            <select v-model="algo" class="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
              <option value="sha256">sha256</option>
              <option value="blake3">blake3</option>
            </select>
          </div>

          <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" @click="createChecksumJob">
            Queue job
          </button>
        </div>
      </div>

      <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 class="text-lg font-bold mb-3">Verify / Compare</h2>
        <div class="space-y-3">
          <div>
            <label class="text-sm font-semibold">Expected</label>
            <input v-model="expected" class="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600" placeholder="expected hash..." />
          </div>
          <div>
            <label class="text-sm font-semibold">Actual (mock)</label>
            <input v-model="actual" class="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600" placeholder="actual hash..." />
          </div>

          <div class="flex items-center gap-2">
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600" @click="mockFillActual">
              Mock fill actual
            </button>
            <button class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" @click="compareNow">
              Compare
            </button>
          </div>

          <div v-if="result" class="p-3 rounded" :class="result.ok ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200'">
            {{ result.message }}
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <NotificationCenter />
    </div>
  </div>

</template>