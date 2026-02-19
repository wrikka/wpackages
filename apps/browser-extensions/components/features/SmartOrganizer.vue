<script setup lang="ts">

// Logic for organizing will be added here

</script>

<template>

  <div class="p-4 bg-gray-800 text-white rounded-lg shadow-lg">
    <h3 class="text-lg font-bold mb-4">Smart Organizer</h3>
    <p class="text-sm text-gray-400 mb-2">Automatically organized items:</p>
    <ul class="space-y-2">
      <li class="flex items-center justify-between p-2 bg-gray-700 rounded">
        <div class="flex items-center">
          <Icon name="ph:article" class="w-5 h-5 mr-2 text-blue-400" />
          <span>Article: AI in 2024</span>
        </div>
        <span class="text-xs px-2 py-1 bg-blue-500 rounded-full">Technology</span>
      </li>
      <li class="flex items-center justify-between p-2 bg-gray-700 rounded">
        <div class="flex items-center">
          <Icon name="ph:link" class="w-5 h-5 mr-2 text-green-400" />
          <span>Vue 3 Documentation</span>
        </div>
        <span class="text-xs px-2 py-1 bg-green-500 rounded-full">Development</span>
      </li>
      <li class="flex items-center justify-between p-2 bg-gray-700 rounded">
        <div class="flex items-center">
          <Icon name="ph:image" class="w-5 h-5 mr-2 text-purple-400" />
          <span>Design Inspiration</span>
        </div>
        <span class="text-xs px-2 py-1 bg-purple-500 rounded-full">Design</span>
      </li>
    </ul>
  </div>

</template>