<script setup lang="ts">


interface GeneratedImage {
  id: string
  url: string
  revisedPrompt?: string
}
defineProps<{
  images: GeneratedImage[]
}>()
defineEmits<{
  select: [image: GeneratedImage]
}>()

</script>

<template>

  <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
    <h4 class="text-sm font-medium mb-2">Recent Images</h4>
    <div class="grid grid-cols-4 gap-2">
      <img
        v-for="img in images"
        :key="img.id"
        :src="img.url"
        class="aspect-square object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
        @click="$emit('select', img)"
      />
    </div>
  </div>

</template>