<script setup lang="ts">

// Logic for video content search will be added here

</script>

<template>

  <div class="p-4 bg-gray-800 text-white rounded-lg shadow-lg">
    <h3 class="text-lg font-bold mb-4">Video Content Search</h3>
    <div class="relative mb-4">
      <input type="text" placeholder="Search within this video..." class="w-full p-2 pl-10 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
      <Icon name="ph:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
    </div>
    <div class="p-3 bg-gray-700 rounded">
      <h4 class="font-bold mb-2">Results:</h4>
      <ul class="text-sm space-y-1">
        <li><a href="#" class="hover:underline">02:35 - Mention of AI models</a></li>
        <li><a href="#" class="hover:underline">05:12 - Discussion on performance</a></li>
      </ul>
    </div>
  </div>

</template>