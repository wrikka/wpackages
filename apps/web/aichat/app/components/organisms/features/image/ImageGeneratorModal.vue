<script setup lang="ts">


interface GeneratedImage {
  id: string
  url: string
  revisedPrompt?: string
}
interface ImageOptions {
  size: string
  quality: string
  style: string
}
const props = defineProps<{
  modelValue: boolean
}>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: [image: GeneratedImage]
}>()
const isOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})
const prompt = ref('')
const generating = ref(false)
const generatedImage = ref<GeneratedImage | null>(null)
const recentImages = ref<GeneratedImage[]>([])
const options = ref<ImageOptions>({
  size: '1024x1024',
  quality: 'standard',
  style: 'vivid',
})
const generateImage = async () => {
  generating.value = true
  try {
    const result = await $fetch<GeneratedImage>('/api/images/generate', {
      method: 'POST',
      body: {
        prompt: prompt.value,
        size: options.value.size,
        quality: options.value.quality,
        style: options.value.style,
      },
    })
    generatedImage.value = result
    recentImages.value.unshift(result)
    if (recentImages.value.length > 8) recentImages.value.pop()
  } catch (error) {
    console.error('Image generation failed:', error)
  } finally {
    generating.value = false
  }
}
const downloadImage = () => {
  if (!generatedImage.value?.url) return
  const a = document.createElement('a')
  a.href = generatedImage.value.url
  a.download = `generated-${Date.now()}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
const selectImage = (img: GeneratedImage) => {
  emit('select', img)
  isOpen.value = false
}
onMounted(async () => {
  const images = await $fetch<GeneratedImage[]>('/api/images/generate')
  recentImages.value = images.slice(0, 8)
})

</script>

<template>

  <div class="image-generator-modal">
    <Modal v-model="isOpen" width="2xl">
      <Card>
        <template #header>
          <div class="space-y-1">
            <h3 class="text-lg font-semibold">AI Image Generator</h3>
            <p class="text-sm text-gray-500">Generate images using DALL-E</p>
          </div>
        
</template>