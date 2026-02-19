<script setup lang="ts">

import type { ImageGenerationRequest } from '~/shared/types/imageGeneration'

const props = defineProps<{
  isGenerating: boolean
  recentPrompts: string[]
}>()
const emit = defineEmits<{
  generate: [prompt: string, options: { model: string; size: string; n: number }]
}>()
const isOpen = ref(false)
const prompt = ref('')
const selectedModel = ref('dall-e-3')
const selectedSize = ref('1024x1024')
const imageCount = ref(1)
const models = [
  { id: 'dall-e-3', name: 'DALL·E 3', sizes: ['1024x1024', '1792x1024', '1024x1792'] },
  { id: 'dall-e-2', name: 'DALL·E 2', sizes: ['1024x1024', '512x512', '256x256'] },
]
const availableSizes = computed(() => {
  return models.find(m => m.id === selectedModel.value)?.sizes || []
})
function generate() {
  if (!prompt.value.trim()) return
  emit('generate', prompt.value, {
    model: selectedModel.value,
    size: selectedSize.value,
    n: imageCount.value,
  })
  prompt.value = ''
  isOpen.value = false
}
function useRecent(p: string) {
  prompt.value = p
}

</script>

<template>

  <div>
    <button class="btn-icon" title="Generate Image" @click="isOpen = true">
      <span class="i-carbon-image"></span>
    </button>
    
    <UModal v-model="isOpen" :ui="{ width: 'max-w-lg' }">
      <UCard>
        <template #header>
          <h3 class="font-semibold">Generate Image</h3>
        
</template>