<template>
  <div v-if="show" class="typing-indicator absolute bottom-2 right-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
    <div class="flex gap-1">
      <div class="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
      <div class="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
      <div class="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
    </div>
    <span class="ml-1">AI is thinking...</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
}

defineProps<Props>()
</script>

<style scoped>
.typing-indicator {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
