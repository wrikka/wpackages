<script setup lang="ts">


interface GeneratedImage {
  id: string
  url: string
  revisedPrompt?: string
}
defineProps<{
  image: GeneratedImage
  prompt: string
}>()

</script>

<template>

  <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
    <img :src="image.url" :alt="prompt" class="w-full h-auto" />
    <div class="p-3 bg-gray-50 dark:bg-gray-800">
      <p class="text-xs text-gray-500">Revised prompt:</p>
      <p class="text-sm">{{ image.revisedPrompt || prompt }}</p>
    </div>
  </div>

</template>