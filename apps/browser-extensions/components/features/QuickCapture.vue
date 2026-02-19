<script setup lang="ts">

// Logic for capturing will be added here

</script>

<template>

  <div class="p-4 bg-gray-800 text-white rounded-lg shadow-lg">
    <h3 class="text-lg font-bold mb-4">Quick Capture</h3>
    <div class="grid grid-cols-2 gap-2">
      <button class="flex items-center justify-center p-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors">
        <Icon name="ph:text-aa" class="w-5 h-5 mr-2" />
        <span>Capture Text</span>
      </button>
      <button class="flex items-center justify-center p-2 bg-green-600 hover:bg-green-700 rounded transition-colors">
        <Icon name="ph:link" class="w-5 h-5 mr-2" />
        <span>Capture Link</span>
      </button>
      <button class="flex items-center justify-center p-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors">
        <Icon name="ph:image" class="w-5 h-5 mr-2" />
        <span>Capture Image</span>
      </button>
      <button class="flex items-center justify-center p-2 bg-red-600 hover:bg-red-700 rounded transition-colors">
        <Icon name="ph:camera" class="w-5 h-5 mr-2" />
        <span>Screenshot</span>
      </button>
    </div>
  </div>

</template>