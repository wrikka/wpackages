<script setup lang="ts">
interface Suggestion {
  id: string | number
  text: string
  [key: string]: any
}

interface Props {
  suggestions: Suggestion[]
  onApplySuggestion: (suggestion: Suggestion) => void
}

defineProps<Props>()
</script>

<template>
  <div v-if="suggestions.length > 0" class="context-suggestions absolute bottom-full left-0 right-0 bg-white dark:bg-gray-800 border rounded-t-lg shadow-lg z-40">
    <div class="p-2 border-b bg-gray-50 dark:bg-gray-900">
      <div class="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
        <UIcon name="i-heroicons-light-bulb" class="w-3 h-3" />
        Context Suggestions
      </div>
    </div>
    <div class="flex flex-wrap gap-1 p-2">
      <UButton
        v-for="suggestion in suggestions.slice(0, 5)"
        :key="suggestion.id"
        size="xs"
        color="gray"
        variant="soft"
        @click="onApplySuggestion(suggestion)"
      >
        {{ suggestion.text }}
      </UButton>
    </div>
  </div>
</template>

<style scoped>
.context-suggestions {
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
