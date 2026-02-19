<script setup lang="ts">

// Logic for new tab page settings will be added here

</script>

<template>

  <div class="p-4 bg-gray-800 text-white rounded-lg shadow-lg">
    <h3 class="text-lg font-bold mb-4">New Tab Page Settings</h3>
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <label for="show-search">Show Search Bar</label>
        <input type="checkbox" id="show-search" checked class="toggle-switch">
      </div>
      <div class="flex items-center justify-between">
        <label for="show-widgets">Show Widgets</label>
        <input type="checkbox" id="show-widgets" checked class="toggle-switch">
      </div>
      <div class="flex items-center justify-between">
        <label for="background-image">Background Image URL</label>
        <input type="text" id="background-image" placeholder="https://..." class="w-1/2 p-1 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>
    </div>
  </div>

</template>

<style>

.toggle-switch {
  /* Add some basic toggle switch styles */
}

</style>