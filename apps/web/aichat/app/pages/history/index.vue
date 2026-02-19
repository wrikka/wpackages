<script setup lang="ts">

import HistoryPanel from '~/components/history/HistoryPanel.vue';

</script>

<template>

  <div class="bg-gray-900 text-white min-h-screen p-8">
    <header class="mb-8">
      <h1 class="text-4xl font-bold mb-2">Action History</h1>
      <p class="text-lg text-gray-400">Review and undo actions taken by the agent.</p>
    </header>
    <HistoryPanel />
  </div>

</template>