<script setup>

import { ref } from 'vue'

const { data: tasks, pending, error } = await useFetch('/api/tasks')
const terminalOutput = ref('$ Ready for a command...')

function runTask(name, command) {
  terminalOutput.value = `> bun run ${name}\n`
  terminalOutput.value += `> ${command}\n\n`
  
  // Simulate task running
  setTimeout(() => {
    terminalOutput.value += `Executing task...\n`
  }, 500)
  
  setTimeout(() => {
    terminalOutput.value += `[1/3] Doing something...\n`
  }, 1200)

  setTimeout(() => {
    terminalOutput.value += `[2/3] Doing something else...\n`
  }, 2000)

  setTimeout(() => {
    terminalOutput.value += `[3/3] Finishing up...\n\n`
    terminalOutput.value += `✅ Task '${name}' completed successfully.\n`
    terminalOutput.value += `$`
  }, 2800)
}

</script>

<template>

  <div class="h-full flex flex-col">
    <h1 class="text-3xl font-bold mb-6">Task Runner</h1>

    <div v-if="pending" class="text-center">Loading tasks...</div>
    <div v-else-if="error" class="text-center text-red-500">Failed to load tasks.</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div 
        v-for="(command, name) in tasks" 
        :key="name" 
        class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow flex items-center justify-between"
      >
        <div>
          <p class="font-semibold text-lg">{{ name }}</p>
          <p class="text-sm text-gray-500 font-mono">bun run {{ name }}</p>
        </div>
        <button @click="runTask(name, command)" class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Run</button>
      </div>
    </div>

    <!-- Mock Terminal Output -->
    <div class="flex-1 flex flex-col">
      <h2 class="text-xl font-bold mb-2">Output</h2>
      <div class="flex-1 p-4 bg-black text-white font-mono text-sm rounded-lg overflow-auto">
        <pre>{{ terminalOutput }}</pre>
      </div>
    </div>
  </div>

</template>