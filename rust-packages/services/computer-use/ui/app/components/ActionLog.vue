<script setup>

import { useLogState } from '~/composables/useLogState'

const columns = [
  {
    key: 'status',
    label: 'Status',
    class: 'w-12'
  },
  {
    key: 'action',
    label: 'Action'
  },
  {
    key: 'time',
    label: 'Time'
  }
]

const { logEntries } = useLogState()


</script>

<template>

  <UCard class="flex-1 flex flex-col h-full" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
    <template #header>
      <h2 class="font-semibold">Action & Audit Log</h2>
    
</template>