<script setup>

import { ref, defineEmits } from 'vue'

defineEmits(['new-task'])

const columns = [
  {
    key: 'name',
    label: 'Session Name'
  },
  {
    key: 'status',
    label: 'Status'
  },
  {
    key: 'actions',
    label: 'Actions'
  }
]

const sessions = ref([
  {
    name: 'agent-1',
    status: 'Running'
  },
  {
    name: 'agent-2',
    status: 'Paused'
  },
  {
    name: 'data-entry-task',
    status: 'Running'
  }
])


</script>

<template>

  <UCard :ui="{ body: { padding: 'p-0 sm:p-0' } }">
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="font-semibold">Session Management</h2>
        <UButton icon="i-heroicons-plus-circle" variant="ghost" color="gray" @click="$emit('new-task')">New Task</UButton>
      </div>
    
</template>