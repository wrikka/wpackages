<script setup lang="ts">

// Logic for saving notes will be added here

</script>

<template>

  <div class="p-4 bg-gray-800 text-white rounded-lg shadow-lg h-full flex flex-col">
    <h3 class="text-lg font-bold mb-4">Notes</h3>
    <textarea placeholder="Jot down your thoughts..." class="w-full flex-grow p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
    <button class="mt-4 w-full p-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors">Save Note</button>
  </div>

</template>