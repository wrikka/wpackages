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
    'Problem',
    'Context',
    'Assumptions',
    'Data',
    'Method',
    'Analysis',
    'Findings',
    'Insights',
    'Recommendations',
    'Next steps',
    'SQL',
    'Python',
  ])
})
const hasStructured = computed(() => {
  const s = sections.value
  return Boolean(s['Findings'] || s['Insights'] || s['Recommendations'] || s['Analysis'])
})

</script>

<template>

  <div class="space-y-2">
    <div class="text-xs font-semibold text-gray-500">Data Analyst</div>

    <div v-if="hasStructured" class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div v-if="sections['Problem']" class="rounded-lg border border-gray-300 bg-white p-3 md:col-span-2">
        <div class="text-xs font-semibold text-gray-500 mb-2">Problem</div>
        <MarkdownRenderer :content="sections['Problem']" />
      </div>

      <div v-if="sections['Assumptions']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Assumptions</div>
        <MarkdownRenderer :content="sections['Assumptions']" />
      </div>

      <div v-if="sections['Data']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Data</div>
        <MarkdownRenderer :content="sections['Data']" />
      </div>

      <div v-if="sections['Analysis']" class="rounded-lg border border-gray-300 bg-white p-3 md:col-span-2">
        <div class="text-xs font-semibold text-gray-500 mb-2">Analysis</div>
        <MarkdownRenderer :content="sections['Analysis']" />
      </div>

      <div v-if="sections['Findings']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Findings</div>
        <MarkdownRenderer :content="sections['Findings']" />
      </div>

      <div v-if="sections['Insights']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Insights</div>
        <MarkdownRenderer :content="sections['Insights']" />
      </div>

      <div v-if="sections['Recommendations']" class="rounded-lg border border-gray-300 bg-white p-3 md:col-span-2">
        <div class="text-xs font-semibold text-gray-500 mb-2">Recommendations</div>
        <MarkdownRenderer :content="sections['Recommendations']" />
      </div>

      <div v-if="sections['SQL']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">SQL</div>
        <MarkdownRenderer :content="sections['SQL']" />
      </div>

      <div v-if="sections['Python']" class="rounded-lg border border-gray-300 bg-white p-3">
        <div class="text-xs font-semibold text-gray-500 mb-2">Python</div>
        <MarkdownRenderer :content="sections['Python']" />
      </div>

      <div v-if="sections['Next steps']" class="rounded-lg border border-gray-300 bg-white p-3 md:col-span-2">
        <div class="text-xs font-semibold text-gray-500 mb-2">Next steps</div>
        <MarkdownRenderer :content="sections['Next steps']" />
      </div>
    </div>

    <div v-else class="rounded-lg border border-gray-300 bg-white p-3">
      <MarkdownRenderer :content="content" />
    </div>
  </div>

</template>