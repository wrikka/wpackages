<script setup lang="ts">


const props = defineProps<{
  content: string
}>()
const normalize = (value: string) => value.replace(/\r\n/g, '\n')
const translateParts = computed(() => {
  const text = normalize(props.content).trim()
  const candidates = ['\n\n---\n\n', '\n\n---\n', '\n\nOriginal:\n', '\n\nTranslation:\n']
  for (const c of candidates) {
    if (text.includes(c)) {
      const parts = text.split(c)
      const left = (parts.shift() ?? '').trim()
      const right = parts.join(c).trim()
      return { left, right }
    }
  }
  if (text.length > 400) {
    const mid = Math.floor(text.length / 2)
    const cut = text.indexOf('\n', mid)
    if (cut !== -1) {
      return { left: text.slice(0, cut).trim(), right: text.slice(cut).trim() }
    }
  }
  return { left: '', right: text }
})
const hasTranslateSplit = computed(() => {
  const p = translateParts.value
  return Boolean(p.left && p.right)
})

</script>

<template>

  <div v-if="hasTranslateSplit" class="grid grid-cols-1 md:grid-cols-2 gap-3">
    <div class="rounded-lg border border-gray-300 bg-white p-3">
      <div class="text-xs font-semibold text-gray-500 mb-2">Original</div>
      <MarkdownRenderer :content="translateParts.left" />
    </div>
    <div class="rounded-lg border border-gray-300 bg-white p-3">
      <div class="text-xs font-semibold text-gray-500 mb-2">Translation</div>
      <MarkdownRenderer :content="translateParts.right" />
    </div>
  </div>

  <div v-else>
    <MarkdownRenderer :content="content" />
  </div>

</template>