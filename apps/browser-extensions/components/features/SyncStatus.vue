<script setup lang="ts">

// Logic for syncing will be added here

</script>

<template>

  <div class="p-4 bg-gray-800 text-white rounded-lg shadow-lg">
    <h3 class="text-lg font-bold mb-4">Sync Status</h3>
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <Icon name="ph:arrows-clockwise" class="w-5 h-5 mr-2 text-green-400 animate-spin" />
        <span>Last synced: Just now</span>
      </div>
      <button class="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">
        <Icon name="ph:arrows-clockwise" class="w-5 h-5" />
      </button>
    </div>
  </div>

</template>