<script setup lang="ts">


const props = defineProps<{
  content: string
}>()
const normalize = (value: string) => value.replace(/\r\n/g, '\n')
const presentSlides = computed(() => {
  const text = normalize(props.content)
  const lines = text.split('\n')
  const slides: Array<{ title: string; body: string }> = []
  let current: { title: string; bodyLines: string[] } | null = null
  const isSlideTitle = (line: string) => {
    const l = line.trim()
    return /^#{1,6}\s*(slide|s\d+|deck|title)\b/i.test(l) || /^slide\s*\d+\b/i.test(l)
  }
  for (const line of lines) {
    if (isSlideTitle(line)) {
      if (current) {
        slides.push({ title: current.title, body: current.bodyLines.join('\n').trim() })
      }
      current = { title: line.replace(/^#{1,6}\s*/, '').trim(), bodyLines: [] }
      continue
    }
    if (!current) {
      continue
    }
    current.bodyLines.push(line)
  }
  if (current) {
    slides.push({ title: current.title, body: current.bodyLines.join('\n').trim() })
  }
  return slides
})
const hasPresentSlides = computed(() => presentSlides.value.length > 0)

</script>

<template>

  <div v-if="hasPresentSlides" class="space-y-2">
    <div class="text-xs font-semibold text-gray-500">Slides</div>
    <details
      v-for="(slide, idx) in presentSlides"
      :key="idx"
      class="rounded-lg border border-gray-300 bg-white"
      :open="idx === 0"
    >
      <summary class="cursor-pointer select-none px-3 py-2 text-sm font-semibold">
        {{ slide.title || `Slide ${idx + 1}` }}
      </summary>
      <div class="px-3 pb-3">
        <MarkdownRenderer :content="slide.body" />
      </div>
    </details>
  </div>

  <div v-else>
    <MarkdownRenderer :content="content" />
  </div>

</template>