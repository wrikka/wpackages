<script setup lang="ts">

import NotificationCenter from '~/components/NotificationCenter.vue'
import { useFileOpsUi } from '~/composables/fileOpsUi'

const { createJob, start, notify } = useFileOpsUi()

const storeUrl = ref('s3://my-bucket')
const connected = ref(false)
const prefix = ref('')
const objects = ref<string[]>([])

const localPath = ref('./file.bin')
const remotePath = ref('path/to/file.bin')

function connect() {
  connected.value = true
  notify('success', 'Connected (mock)', storeUrl.value)
  refreshList()
}

function refreshList() {
  objects.value = Array.from({ length: 8 }).map((_, i) => `${prefix.value}object_${i}.bin`)
}

function queueUpload() {
  const job = createJob({
    type: 'cloud_upload',
    title: `Cloud upload: ${localPath.value} -> ${remotePath.value}`,
    input: { storeUrl: storeUrl.value, localPath: localPath.value, remotePath: remotePath.value },
  })
  start(job.id)
}

function queueDownload(obj: string) {
  const job = createJob({
    type: 'cloud_download',
    title: `Cloud download: ${obj} -> ./downloads/${obj}`,
    input: { storeUrl: storeUrl.value, remotePath: obj, localPath: `./downloads/${obj}` },
  })
  start(job.id)
}

function queueDelete(obj: string) {
  const job = createJob({
    type: 'delete',
    title: `Cloud delete (mock): ${obj}`,
    input: { storeUrl: storeUrl.value, remotePath: obj },
  })
  start(job.id)
}

</script>

<template>

  <div class="p-4">
    <h1 class="text-3xl font-bold mb-2">Cloud</h1>
    <p class="text-sm text-gray-500 mb-6">UI-only mock for object-store browsing + upload/download jobs.</p>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 class="text-lg font-bold mb-3">Connection</h2>

        <div class="space-y-3">
          <div>
            <label class="text-sm font-semibold">Store URL (mock)</label>
            <input v-model="storeUrl" class="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600" placeholder="s3://my-bucket" />
          </div>

          <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" @click="connect">
            Connect
          </button>

          <div v-if="connected" class="text-sm text-green-700 dark:text-green-200">
            Connected (mock): {{ storeUrl }}
          </div>
        </div>
      </div>

      <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 class="text-lg font-bold mb-3">Browse (mock)</h2>

        <div class="flex items-center gap-2 mb-3">
          <input v-model="prefix" class="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600" placeholder="prefix/" />
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600" @click="refreshList">
            Refresh
          </button>
        </div>

        <div class="space-y-2">
          <div v-for="obj in objects" :key="obj" class="p-2 rounded border dark:border-gray-700 flex items-center justify-between">
            <span class="font-mono text-xs truncate">{{ obj }}</span>
            <div class="flex gap-2">
              <button class="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600" @click="queueDownload(obj)">
                Download
              </button>
              <button class="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600" @click="queueDelete(obj)">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 class="text-lg font-bold mb-3">Upload (mock)</h2>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div>
          <label class="text-sm font-semibold">Local path</label>
          <input v-model="localPath" class="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600" placeholder="./file.bin" />
        </div>
        <div>
          <label class="text-sm font-semibold">Remote path</label>
          <input v-model="remotePath" class="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600" placeholder="path/to/file.bin" />
        </div>
        <div class="flex items-end">
          <button class="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" @click="queueUpload">
            Queue upload job
          </button>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <NotificationCenter />
    </div>
  </div>

</template>