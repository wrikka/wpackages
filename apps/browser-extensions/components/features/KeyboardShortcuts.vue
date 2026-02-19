<script setup lang="ts">

// Logic for setting shortcuts will be added here

</script>

<template>

  <div class="p-4 bg-gray-800 text-white rounded-lg shadow-lg">
    <h3 class="text-lg font-bold mb-4">Keyboard Shortcuts</h3>
    <ul class="space-y-2">
      <li class="flex items-center justify-between p-2 bg-gray-700 rounded">
        <span>Quick Capture</span>
        <input type="text" value="Ctrl+Shift+C" class="w-32 p-1 bg-gray-600 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500">
      </li>
      <li class="flex items-center justify-between p-2 bg-gray-700 rounded">
        <span>Open Search</span>
        <input type="text" value="Ctrl+Shift+F" class="w-32 p-1 bg-gray-600 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500">
      </li>
      <li class="flex items-center justify-between p-2 bg-gray-700 rounded">
        <span>Toggle Sidebar</span>
        <input type="text" value="Ctrl+Shift+S" class="w-32 p-1 bg-gray-600 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500">
      </li>
    </ul>
  </div>

</template>