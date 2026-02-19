<script setup lang="ts">

import NotificationCenter from '~/components/NotificationCenter.vue'
import { useFileOpsUi } from '~/composables/fileOpsUi'

const { createJob, start } = useFileOpsUi()

const from = ref('./input.txt')
const to = ref('./input.txt.gz')
const format = ref<'gzip' | 'zstd'>('gzip')
const level = ref(3)

const from2 = ref('./input.txt.gz')
const to2 = ref('./output.txt')

function queueCompress() {
  const job = createJob({
    type: 'compress',
    title: `Compress (${format.value}): ${from.value} -> ${to.value}`,
    input: { from: from.value, to: to.value },
    options: { format: format.value, level: level.value },
  })
  start(job.id)
}

function queueDecompress() {
  const job = createJob({
    type: 'decompress',
    title: `Decompress: ${from2.value} -> ${to2.value}`,
    input: { from: from2.value, to: to2.value },
  })
  start(job.id)
}

</script>

<template>

  <div class="p-4">
    <h1 class="text-3xl font-bold mb-2">Compression</h1>
    <p class="text-sm text-gray-500 mb-6">UI-only mock for gzip/zstd compression and decompression.</p>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 class="text-lg font-bold mb-3">Compress</h2>

        <div class="space-y-3">
          <div>
            <label class="text-sm font-semibold">From</label>
            <input v-model="from" class="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600" placeholder="./input.txt" />
          </div>
          <div>
            <label class="text-sm font-semibold">To</label>
            <input v-model="to" class="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600" placeholder="./input.txt.gz" />
          </div>
          <div>
            <label class="text-sm font-semibold">Format</label>
            <select v-model="format" class="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
              <option value="gzip">gzip</option>
              <option value="zstd">zstd</option>
            </select>
          </div>
          <div v-if="format === 'zstd'">
            <label class="text-sm font-semibold">Level</label>
            <input v-model.number="level" type="number" class="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600" />
          </div>

          <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" @click="queueCompress">
            Queue compress job
          </button>
        </div>
      </div>

      <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 class="text-lg font-bold mb-3">Decompress</h2>

        <div class="space-y-3">
          <div>
            <label class="text-sm font-semibold">From</label>
            <input v-model="from2" class="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600" placeholder="./input.txt.gz" />
          </div>
          <div>
            <label class="text-sm font-semibold">To</label>
            <input v-model="to2" class="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600" placeholder="./output.txt" />
          </div>

          <button class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" @click="queueDecompress">
            Queue decompress job
          </button>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <NotificationCenter />
    </div>
  </div>

</template>