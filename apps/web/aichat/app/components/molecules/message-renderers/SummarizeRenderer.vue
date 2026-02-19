<script setup lang="ts">


const props = defineProps<{
  content: string
}>()
const normalize = (value: string) => value.replace(/\r\n/g, '\n')
const summarizeSections = computed(() => {
  const text = normalize(props.content)
  const headings = ['TL;DR', 'Key points', 'Important details', 'Action items']
  const result: Record<string, string> = {}
  for (let i = 0; i < headings.length; i++) {
    const h = headings[i]
    const next = headings[i + 1]
    const re = new RegExp(`(^|\\n)#{1,6}\\s*${h}\\s*\\n`, 'i')
    const match = re.exec(text)
    if (!match) continue
    const start = match.index + match[0].length
    let end = text.length
    if (next) {
      const reNext = new RegExp(`(^|\\n)#{1,6}\\s*${next}\\s*\\n`, 'i')
      const nextMatch = reNext.exec(text.slice(start))
      if (nextMatch) {
        end = start + nextMatch.index
      }
    }
    result[h] = text.slice(start, end).trim()
  }
  return result
})
const hasSummarizeSections = computed(() => {
  const s = summarizeSections.value
  return Boolean(s['TL;DR'] || s['Key points'] || s['Important details'] || s['Action items'])
})

</script>

<template>

  <div v-if="hasSummarizeSections" class="space-y-3">
    <div class="grid grid-cols-1 gap-3">
      <div v-if="summarizeSections['TL;DR']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">TL;DR</div>
        <MarkdownRenderer :content="summarizeSections['TL;DR']" />
      </div>

      <div v-if="summarizeSections['Key points']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Key points</div>
        <MarkdownRenderer :content="summarizeSections['Key points']" />
      </div>

      <div v-if="summarizeSections['Important details']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Important details</div>
        <MarkdownRenderer :content="summarizeSections['Important details']" />
      </div>

      <div v-if="summarizeSections['Action items']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Action items</div>
        <MarkdownRenderer :content="summarizeSections['Action items']" />
      </div>
    </div>
  </div>

  <div v-else>
    <MarkdownRenderer :content="content" />
  </div>

</template>