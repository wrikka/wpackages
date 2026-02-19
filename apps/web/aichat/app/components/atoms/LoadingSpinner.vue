<script setup lang="ts">


defineProps<{
  message?: string
}>()

</script>

<template>

  <div class="text-center py-4">
    <div class="inline-flex items-center justify-center w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
    <p class="text-sm text-gray-500">{{ message }}</p>
  </div>

</template>