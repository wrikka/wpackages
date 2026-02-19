<script setup lang="ts">


const props = defineProps<{
  content: string
}>()
const normalize = (value: string) => value.replace(/\r\n/g, '\n')
const splitByHeadings = (text: string, headings: string[]) => {
  const t = normalize(text)
  const out: Record<string, string> = {}
  for (let i = 0; i < headings.length; i++) {
    const h = headings[i]
    const next = headings[i + 1]
    const re = new RegExp(`(^|\\n)#{1,6}\\s*${h}\\s*\\n`, 'i')
    const m = re.exec(t)
    if (!m) continue
    const start = m.index + m[0].length
    let end = t.length
    if (next) {
      const reNext = new RegExp(`(^|\\n)#{1,6}\\s*${next}\\s*\\n`, 'i')
      const nm = reNext.exec(t.slice(start))
      if (nm) end = start + nm.index
    }
    out[h] = t.slice(start, end).trim()
  }
  return out
}
const sections = computed(() => {
  return splitByHeadings(props.content, [
    'Summary',
    'Decisions',
    'Action items',
    'Risks/blockers',
    'Next steps',
    'Next meeting agenda',
  ])
})
const hasStructured = computed(() => {
  const s = sections.value
  return Boolean(s['Summary'] || s['Decisions'] || s['Action items'] || s['Next steps'])
})

</script>

<template>

  <div class="space-y-2">
    <div class="text-xs font-semibold text-gray-500">Meeting Notes</div>

    <div v-if="hasStructured" class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div v-if="sections['Summary']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Summary</div>
        <MarkdownRenderer :content="sections['Summary']" />
      </div>
      <div v-if="sections['Decisions']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Decisions</div>
        <MarkdownRenderer :content="sections['Decisions']" />
      </div>
      <div v-if="sections['Action items']" class="rounded-lg border border-gray-300 bg-white p-3 md:col-span-2">
        <div class="text-xs font-semibold text-gray-500 mb-2">Action items</div>
        <MarkdownRenderer :content="sections['Action items']" />
      </div>
      <div v-if="sections['Risks/blockers']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Risks / blockers</div>
        <MarkdownRenderer :content="sections['Risks/blockers']" />
      </div>
      <div v-if="sections['Next steps']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Next steps</div>
        <MarkdownRenderer :content="sections['Next steps']" />
      </div>
    </div>

    <div v-else class="rounded-lg border border-gray-300 bg-white p-3">
      <MarkdownRenderer :content="content" />
    </div>
  </div>

</template>