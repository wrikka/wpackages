<script setup>

import { ref } from 'vue'

const refreshSnapshot = () => {
  console.log('Refreshing snapshot...')
  // Logic to call the computer-use snapshot command will go here
}

const elements = ref([
  {
    label: 'Window: "AI Computer Use"',
    icon: 'i-heroicons-window',
    defaultOpen: true,
    content: 'Element properties and nested elements will be shown here. Children can be represented by another accordion.'
  },
  {
    label: 'Button: "OK"',
    icon: 'i-heroicons-cursor-arrow-rays',
    content: 'Element ID: @e1, Role: Button, Bounding Box: [100, 200, 50, 30]'
  },
  {
    label: 'Input: "Username"',
    icon: 'i-heroicons-pencil',
    content: 'Element ID: @e2, Role: TextField, Value: ""'
  }
])

</script>

<template>

  <UCard class="flex-1 h-full flex flex-col" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="font-semibold">Snapshot Inspector</h2>
        <UButton icon="i-heroicons-arrow-path" variant="ghost" color="gray" @click="refreshSnapshot">Refresh</UButton>
      </div>
    
</template>