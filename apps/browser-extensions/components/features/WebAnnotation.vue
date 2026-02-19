<script setup lang="ts">

// Logic for sharing annotations will be added here

</script>

<template>

  <div class="p-4 bg-gray-800 text-white rounded-lg shadow-lg">
    <h3 class="text-lg font-bold mb-4">Web Annotation Sharing</h3>
    <div class="space-y-3">
      <p class="text-sm text-gray-400">Share your highlights and notes with your team.</p>
      <div class="flex items-center space-x-2">
        <input type="text" placeholder="Enter team member's email" class="flex-grow p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        <button class="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Share</button>
      </div>
      <div class="mt-4">
        <h4 class="font-bold mb-2">Shared with:</h4>
        <ul class="text-sm list-disc list-inside">
          <li>user1@example.com</li>
          <li>user2@example.com</li>
        </ul>
      </div>
    </div>
  </div>

</template>