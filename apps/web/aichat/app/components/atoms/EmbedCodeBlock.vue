<script setup lang="ts">


defineProps<{
  code: string
}>()
defineEmits<{
  copy: []
}>()

</script>

<template>

  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium">Embed Code</span>
      <Button size="xs" variant="secondary" @click="$emit('copy')">
        <Icon name="lucide:clipboard" class="w-4 h-4 mr-1" />
        Copy
      </Button>
    </div>
    <pre class="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto"><code>{{ code }}</code></pre>
  </div>

</template>