<script setup lang="ts">
const { data, error, pending, refresh } = useGit();
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Git Status</h1>
      <button @click="refresh" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors flex items-center gap-2" :disabled="pending">
        <Icon name="i-mdi-refresh" :class="{ 'animate-spin': pending }" />
        Refresh
      </button>
    </div>

    <div v-if="error" class="text-red-400 bg-red-900/20 p-4 rounded-lg">Error: {{ error.message }}</div>

    <div v-if="pending && !data" class="space-y-4">
      <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 inline-block animate-pulse">
        <div class="h-6 bg-gray-700 rounded w-48"></div>
      </div>
      <GitStatusTableSkeleton />
    </div>
    
    <div v-if="data" class="space-y-4">
      <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 inline-block">
        <span class="font-semibold">Current Branch:</span>
        <span class="ml-2 font-mono bg-blue-900/50 px-2 py-1 rounded">{{ data.branch }}</span>
      </div>
      <GitStatusTable :files="data.files" />
    </div>
  </div>
</template>
