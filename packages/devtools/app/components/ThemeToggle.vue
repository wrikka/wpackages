<script setup lang="ts">
const colorMode = useColorMode()

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <button @click="toggleTheme" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
    <span v-if="colorMode.value === 'dark'" class="i-heroicons-sun-20-solid w-5 h-5"></span>
    <span v-else class="i-heroicons-moon-20-solid w-5 h-5"></span>
  </button>
</template>
