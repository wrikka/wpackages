<script setup lang="ts">

// Logic for Pomodoro timer will be added here

</script>

<template>

  <div class="p-4 bg-gray-800 text-white rounded-lg shadow-lg text-center">
    <h3 class="text-lg font-bold mb-2">Pomodoro Timer</h3>
    <div class="text-5xl font-mono mb-4">25:00</div>
    <div class="flex justify-center space-x-2">
      <button class="p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors">
        <Icon name="ph:play" class="w-6 h-6" />
      </button>
      <button class="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors">
        <Icon name="ph:stop" class="w-6 h-6" />
      </button>
      <button class="p-2 bg-gray-600 hover:bg-gray-500 rounded-full transition-colors">
        <Icon name="ph:arrows-counter-clockwise" class="w-6 h-6" />
      </button>
    </div>
  </div>

</template>