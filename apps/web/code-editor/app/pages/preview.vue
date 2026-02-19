<script setup>

import { ref } from 'vue'

const previewUrl = ref('http://localhost:3000')
const iframeSrc = ref(previewUrl.value)

function refreshPreview() {
  // By changing the key or the src, we can force the iframe to reload
  const url = iframeSrc.value
  iframeSrc.value = ''
  setTimeout(() => {
    iframeSrc.value = url
  }, 100)
}

</script>

<template>

  <div class="h-full flex flex-col">
    <h1 class="text-3xl font-bold mb-4">Live Preview</h1>
    
    <!-- Controls -->
    <div class="flex items-center gap-4 mb-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div class="flex-1">
        <input 
          type="text" 
          v-model="previewUrl" 
          class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="http://localhost:3000"
        />
      </div>
      <button @click="refreshPreview" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Refresh</button>
      <a :href="previewUrl" target="_blank" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Open in New Tab</a>
    </div>

    <!-- Preview Area -->
    <div class="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
      <iframe :src="iframeSrc" class="w-full h-full" frameborder="0"></iframe>
    </div>
  </div>

</template>